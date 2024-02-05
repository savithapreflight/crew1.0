import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Switch, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import PushNotification from 'react-native-push-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format, differenceInMinutes } from 'date-fns';

const createChannels = () =>{
  PushNotification.createChannel(
    {
      channelId:'Crew-Port',
      channelName:'Crewport Channel'
    }
    )
    console.log('channel created')
}

const db = SQLite.openDatabase(
  { name: 'CrewportDatabase.db', location: 'default' },
  () => {},
  (error) => {
    console.error('Error opening database: ', error);
  }
);

// const custom='17:55'

const Alarm = () => {
  const [flightTime, setFlightTime] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [toggleNotification, setToggleNotification] = useState(true);
  const [selectedHours, setSelectedHours] = useState('02');
  const [selectedMinutes, setSelectedMinutes] = useState('00');
  const [timeCompleted, setTimeCompleted] = useState(false);

  const defaultSelectedTime = '02:00';

  useEffect(() => {
    fetchFlightTime();
  }, []);

  const toggleSwitch = () => {
    const isNotificationEnabled = !toggleNotification;
    setToggleNotification(isNotificationEnabled);
    if (isNotificationEnabled) {
      // If toggle is switched on, trigger notification
      if (selectedHours && selectedMinutes) {
        const timeDiff = `${selectedHours}:${selectedMinutes}`;
        scheduleNotification(timeDiff);
      }
    } else {
      // If toggle is switched off, cancel all scheduled notifications
      PushNotification.cancelAllLocalNotifications();
      console.log('All notifications cancelled.');
    }
  };
  

  const fetchFlightTime = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT patternStTime FROM roster_details WHERE date(flightDate) = date('now')`,
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            const flightTimeFromQuery =  rows.item(0).patternStTime;
            // const flightTimeFromQuery = rows.item(0).patternStTime;
            const formattedTime =  flightTimeFromQuery.slice(11, 16);
            setFlightTime(formattedTime);
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
  
      // Parse the flight time to hours and minutes
      const [flightHours, flightMinutes] = flightTime.split(':').map(Number);
  
      // Calculate the time difference
      let hoursDiff = flightHours - selectedTimeHours;
      let minutesDiff = flightMinutes - selectedTimeMinutes;
  
      if (hoursDiff < 1 || (hoursDiff === 1 && minutesDiff < 0)) {
        Alert.alert('Please select a time 1 hour or more before the flight time.');
        return;
      }
  
      if (minutesDiff < 0) {
        hoursDiff -= 1;
        minutesDiff += 60;
      }
  
      const timeDiff = `${hoursDiff}:${minutesDiff}`;
      // console.log('Time Difference:', timeDiff);
  
      // Check if the selected time is already past
      const currentTime = new Date();
      const selectedDateTime = new Date();
      selectedDateTime.setHours(selectedTimeHours);
      selectedDateTime.setMinutes(selectedTimeMinutes);
  
      if (currentTime > selectedDateTime) {
        setTimeCompleted(true);
      } else {
        setTimeCompleted(false);
      }
  
      // Schedule the notification
      scheduleNotification(timeDiff);
    } else {
      setShowTimePicker(false);
    }
  };
  
  
  useEffect(() => {
    try {
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
      // console.log('Time Difference:', timeDiff);

      // Schedule the notification
      scheduleNotification(timeDiff);
    } catch (error) {
      // console.error('Error in useEffect:', error);
    }
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
    // console.log('Time Difference:', timeDiff);
    // console.log('Scheduled Notification Time:', notificationTimeString);
  
    const currentTime = new Date();
    if (notificationTime < currentTime) {
      console.log('Time is already Completed');
      setTimeCompleted(true);
      return;
    }
    setTimeCompleted(false);
  
    PushNotification.localNotificationSchedule({
      channelId: 'Crew-Port',
      message: `Your flight is scheduled ${flightTime}`,
      date: notificationTime,
    });
  };
  
  
  
    
 useEffect(()=>{
  createChannels();
 })

  

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

export default Alarm;
