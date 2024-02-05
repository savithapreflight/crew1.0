import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity,Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import PushNotification from 'react-native-push-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const db = SQLite.openDatabase(
  { name: 'CrewportDatabase.db', location: 'default' },
  () => {},
  (error) => {
    console.error('Error opening database: ', error);
  }
);

const AlarmUTC = ({ isAlarmEnabled, onToggle }) => {
  const [flightTime, setFlightTime] = useState('');
  const [flightNos, setFlightNos] = useState('');

  const [flightsdate, setFlightsdate] = useState('');

  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [toggleNotification, setToggleNotification] = useState(true);
  const [selectedHours, setSelectedHours] = useState('02');
  const [selectedMinutes, setSelectedMinutes] = useState('00');
  const [timeCompleted, setTimeCompleted] = useState(false);

  const defaultSelectedTime = '02:00';
  const subtractHours = 2;
  const defaultNotificationHours = '02';
  const defaultNotificationMinutes = '00';

  const createChannels = () =>{
    PushNotification.createChannel(
      {
        channelId:'Crew-Port',
        channelName:'Crewport Channel'
      }
      )
      console.log('channel created utc Time')
  }

  useEffect(() => {
    fetchFlightTime();
    createChannels();
  }, []);

  const toggleSwitch = () => {
    const isNotificationEnabled = !toggleNotification;
    setToggleNotification(isNotificationEnabled);
    if (isNotificationEnabled) {
      // If toggle is switched on, trigger notification
      const timeDiff = `${defaultNotificationHours}:${defaultNotificationMinutes}`;
      scheduleNotification(timeDiff);
    } else {
      // If toggle is switched off, cancel all scheduled notifications
      PushNotification.cancelAllLocalNotifications();
      console.log('All notifications cancelled UTC.');
    }
  };
  



  const fetchFlightTime = () => {
    db.transaction((tx) => {
        tx.executeSql(
            `SELECT DISTINCT flightDate, patternStTime FROM roster_details WHERE 
            date(flightDate) IN (date('now'), date('now', '+1 day'));`,
            [],
            (_, { rows }) => {
                if (rows.length > 0) {
                    const todayFlightDateStr = rows.item(0).patternStTime;
                    // console.log(todayFlightDateStr, "today pattern");
                    const tomorrowFlightDateStr = rows.item(1).patternStTime;
                    // console.log(tomorrowFlightDateStr, "tomorrow pattern");

                    const todayFlightdate = new Date(rows.item(0).flightDate);
                    // console.log(todayFlightdate, "today flight date");
                    const tomorrowFlightdate = new Date(rows.item(1).flightDate);
                    // console.log(tomorrowFlightdate, "tmw flight date");

                    const todayFlightTime = todayFlightDateStr.substring(0, 19);
                    // console.log(todayFlightTime, "today flight time");
                    const tomorrowFlightTime = tomorrowFlightDateStr.substring(0, 19);
                    // console.log(tomorrowFlightTime, "tomorrow flight time");

                    const todayAdjustedTime = new Date(new Date(todayFlightTime).getTime() - 8 * 60 * 60 * 1000);
                    const tomorrowAdjustedTime = new Date(new Date(tomorrowFlightTime).getTime() - 8 * 60 * 60 * 1000);

                    const currentDate = new Date();
                    const currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2);
                    const currentDay = ("0" + currentDate.getDate()).slice(-2);

                    const todayMonth = todayAdjustedTime.toISOString().slice(5, 7);
                    const todayDay = todayAdjustedTime.toISOString().slice(8, 10);

                    let selectedFlightTime = '';
                    let selectedFlightDate = '';

                    if (currentMonth === todayMonth && currentDay === todayDay) {
                        selectedFlightTime = todayAdjustedTime.toTimeString().slice(0, 5);
                        selectedFlightDate = todayAdjustedTime.toISOString().slice(0, 10);
                        // console.log("Today's adjusted date:", selectedFlightDate, "Adjusted time:", selectedFlightTime);
                    } else {
                        selectedFlightTime = tomorrowAdjustedTime.toTimeString().slice(0, 5);
                        selectedFlightDate = tomorrowAdjustedTime.toISOString().slice(0, 10);
                        // console.log("Tomorrow's adjusted date:", selectedFlightDate, "Adjusted time:", selectedFlightTime);
                    }

                    const consoleAfter8Hrs = new Date();
                    consoleAfter8Hrs.setHours(consoleAfter8Hrs.getHours() + 8);
                    // console.log("Console After 8 Hours:", consoleAfter8Hrs);

                    setFlightTime(selectedFlightTime);
                    setFlightsdate(`${selectedFlightDate} ${selectedFlightTime}`);
                    setFlightNos(rows.item(0).flightNo);
                }
            },
            (_, error) => {
                console.error('Error fetching flightTime: ', error);
            }
        );
    });
};


 
  
 

  const handleTimeSelection = () => {
    setShowTimePicker(true);
  };

  const handleTimePickerChange = (event, selected) => {
    if (event.type === 'set' && selected) {
      const selectedDate = new Date(selected);
      setSelectedTime(selectedDate);
      setShowTimePicker(false);
      const selectedTimeHours = selectedDate.getHours();
      const selectedTimeMinutes = selectedDate.getMinutes();

      // Update the selected hours and minutes states
      setSelectedHours(String(selectedTimeHours).padStart(2, '0'));
      setSelectedMinutes(String(selectedTimeMinutes).padStart(2, '0'));
      if (selectedTimeHours < 1 || selectedTimeHours > 10) {
        Alert.alert('Please select a time between 1 and 10 hours.');
        return;
    }
    
    const [flightHours, flightMinutes] = flightTime.split(':').map(Number);
    
    let hoursDiff = flightHours - selectedTimeHours;
    let minutesDiff = flightMinutes - selectedTimeMinutes;
    
    if (hoursDiff < 1) {
        Alert.alert('Please select a time 1 hour or more before the flight time.');
        return;
    }
    

    if (minutesDiff < 0) {
        hoursDiff -= 1;
        minutesDiff += 60;
    }

    const timeDiff = `${hoursDiff}:${minutesDiff}`;
    // console.log('Time Difference:', timeDiff);
    scheduleNotification(timeDiff);
} else {
    setShowTimePicker(false);
}
};

  useEffect(() => {
    const [defaultHours, defaultMinutes] = defaultSelectedTime.split(':').map(Number);
    const [flightHours, flightMinutes] = flightTime.split(':').map(Number);
    
    let hoursDiff = flightHours - Number(selectedHours);
    let minutesDiff = flightMinutes - Number(selectedMinutes);
    
    if (hoursDiff < 1 || (hoursDiff === 1 && minutesDiff < 0)) {
      console.log('Please select a time 1 hour or more before the flight time.');
      return;
    }
    
    if (minutesDiff < 0) {
      hoursDiff -= 1;
      minutesDiff += 60;
    }
    
    const timeDiff = `${hoursDiff}:${minutesDiff}`;
    console.log('Time Difference:', timeDiff);
    scheduleNotification(timeDiff);
  }, [flightTime, selectedHours, selectedMinutes]);


  const scheduleNotification = (timeDiff) => {
    if (!toggleNotification) {
        console.log('Console Notification is turned off');
        return;
    }
  
    const [hoursDiff, minutesDiff] = timeDiff.split(':').map(Number);
    const notificationTime = new Date();
    notificationTime.setHours(hoursDiff);
    notificationTime.setMinutes(minutesDiff);
    notificationTime.setSeconds(0);
  
    const notificationTimeString = `${String(notificationTime.getHours()).padStart(2, '0')}:${String(
        notificationTime.getMinutes()
    ).padStart(2, '0')}`;
    console.log('Time Difference:', timeDiff);
    console.log('Scheduled Notification Time:', notificationTimeString);
  
    const currentTime = new Date();
    if (notificationTime < currentTime) {
        console.log('Time is in the past');
        // handle this case based on your requirement, you can choose to schedule it for the next day or ignore it
        return;
    }
  
    setTimeCompleted(false);
  
    PushNotification.localNotificationSchedule({
        channelId: 'Crew-Port',
        message: `Your flight is scheduled ${flightTime}`,
        date: notificationTime,
    });
};



  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
     
      <Text style={{ marginLeft: 10 }}>{`${selectedHours}:${selectedMinutes}`}</Text>
      <TouchableOpacity onPress={handleTimeSelection}>
        <Ionicons 
        name={'time-outline'}
         size={25}
         color={timeCompleted ? 'red' : 'black'} />
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
          onChange={handleTimePickerChange}
        />
      )}
      <Switch
        // trackColor={{ false: "#767577", true: "#81b0ff" }}
        // thumbColor={toggleNotification ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={toggleNotification}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flightText: {
    // Your common text styles here
  },
  boldText: {
    fontWeight: 'bold',
  },
  normalText: {
    fontWeight: 'normal',
  },
});

export default AlarmUTC;
