import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import { _colors } from '../../../css/colors';
import useDefaultTheme from '../../../hooks/useDefaultTheme';
import { openDatabase } from 'react-native-sqlite-storage';
import { useState } from 'react';
import { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import TotalData from '../tomorrow/totalData';
import { convertTimeToMSD } from '../timeUtlize';
import { getRosterDetailsApi } from '../../../api/roster/rosterDetailsApi';
import { initializeDatabaseStructure } from '../../../db/initializeDatabaseStructure';
import { useNavigation } from '@react-navigation/native';



var db = openDatabase({ name: 'CrewportDatabase.db' });
  
const TomorrowMSD = () => {
  useEffect(() => {
    async () => {
      await getRosterDetailsApi();
      await initializeDatabaseStructure();
    }
  }, []);

  const [flightNo, setFlightNo] = useState('');
  const [startFrom,setStartFrom] = useState('');
  const [endsAt,setEndsAt] = useState('');
  const [patternStTime,setPatternStTime] = useState('');
  const [patternEndTime,setPatternEndTime] = useState('');
  const [tData, setTData] = useState('');
  const [dataVisible, setDataVisible] = useState(false);
  const [dutyCount, setDutyCount] = useState('');
  const [airCraftType,setAirCraftType] = useState('');
  const [tableStart,setTableStart] = useState('');
  const [tableEnd,setTableEnd] = useState('');
  const [tableFlightNo,setTableFlightNo] = useState('');
  const [departure,setDeparture] = useState('');
  const [arrival,setArrival] = useState('');
  const [dutySt,setDutySt] = useState('');
  const [dutyEnd,setDutyEnd] = useState('');
  const [flightDates,setFlightDates] = useState('');
  const [visible,setVisible] = useState('');
  const [checkinvisible,setCheckinVisible] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [selectedLocation,setSelectedLocation] = useState('');
  const [isCheckinDisabled, setIsCheckinDisabled] = useState(false);
  const [isCoordinatesAdded, setIsCoordinatesAdded] = useState(false);
  const [isCoordinatesAddedOut, setIsCoordinatesAddedOut] = useState(false);
  const [isRepInSet, setIsRepInSet] = useState(false);
  const [isRepOutSet, setIsRepOutSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  

  const navigation=useNavigation();

  
  const openData = ()=>{
    setDataVisible(true);
  };
  
  const closeData = ()=>{
    setDataVisible(false);
  }
  const fetchData = async () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT crewCode, crewDesig, flightDate, patternNo, flightNo, deptTime, arrTime, startFrom, endsAt,
          flightFrom, flightTo, restPeriod, aircraftType, patternStTime, patternEndTime, id, isVoilated, voilationReason,
          reptIn, reptOut, createdDate, modifiedDate FROM roster_details
          WHERE date(flightDate) = date('now', '+1 day', 'localtime')`,
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              const { flightNo, startFrom, endsAt, patternStTime, patternEndTime } = results.rows.item(0);
              const data = results.rows.raw();
              setTData(data);
  
              const aircraftType = Array.from(results.rows.raw().map(item => item.aircraftType));
              const departures = Array.from(results.rows.raw().map(item => item.flightFrom));
              const arrivals = Array.from(results.rows.raw().map(item => item.flightTo));
              const starts = Array.from(results.rows.raw().map(item => item.deptTime));
              const ends = Array.from(results.rows.raw().map(item => item.arrTime));
              const stduty = Array.from(new Set(results.rows.raw().map(item => item.patternStTime)));
              const enduty = Array.from(new Set(results.rows.raw().map(item => item.patternEndTime)));
              const flightDate = Array.from(new Set(results.rows.raw().map(item => item.flightDate)));
              const flightNumbers = Array.from(new Set(results.rows.raw().map(item => item.flightNo)));
  
              setDutyCount(flightNumbers.length);
              setAirCraftType(aircraftType);
              setFlightNo(flightNo);
              setStartFrom(startFrom);
              setEndsAt(endsAt);
              setPatternStTime(patternStTime);
              setPatternEndTime(patternEndTime);
  
              // Convert time values to MSD format
              const startsInMSD = starts.map(date => convertTimeToMSD(new Date(date)));
              // console.log(startsInMSD,"tablestart")
              const endsInMSD = ends.map(date => convertTimeToMSD(new Date(date)));
              const stdutyInMSD = stduty.map(date => convertTimeToMSD(new Date(date)));
              // console.log(stdutyInMSD,"stdutyyyy")
              const endutyInMSD = enduty.map(date => convertTimeToMSD(new Date(date)));
  
              setTableStart(startsInMSD);
              setTableEnd(endsInMSD);
              setDutySt(stdutyInMSD);
              setDutyEnd(endutyInMSD);
              setTableFlightNo(flightNumbers);
              setDeparture(departures);
              setArrival(arrivals);
              setFlightDates(flightDate);
            }
            resolve();
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    }).catch(error => {
      console.log(error);
    });
  };
  
  useEffect(() => {
    getRosterDetailsApi();
   fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating a 10-second delay using setTimeout (replace this with your data-fetching logic)
        setTimeout(() => {
          setIsLoading(false); // Once the data is loaded, set isLoading to false
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false); // In case of an error, set isLoading to false
      }
    };

    fetchData(); // Call the fetch data function on component mount
  }, []);


  const start = Array.isArray(tableStart) ? tableStart.map((date) => {
    const msdDate = convertTimeToMSD(new Date(date));
  
    const hours = String(msdDate.getHours()).padStart(2, '0');
    const minutes = String(msdDate.getMinutes()).padStart(2, '0');
    const convertedTime = `${hours}:${minutes}`;
  
    return convertedTime;
  }) : [];
  
  
  const end = Array.isArray(tableEnd) ? tableEnd.map((date) => {
    const msdDate = convertTimeToMSD(new Date(date));
  
    const hours = String(msdDate.getHours()).padStart(2, '0');
    const minutes = String(msdDate.getMinutes()).padStart(2, '0');
    const convertedTime = `${hours}:${minutes}`;
  
    return convertedTime;
  }) : [];


  const convertToMSD = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  let time = [];
  
  if (start.length > 0 && end.length > 0) {
    const timeDifferences = start.map((startTime, index) => {
      const startMSD = convertToMSD(startTime);
      const endMSD = convertToMSD(end[index]);
  
      let timeDiff = endMSD - startMSD;
  
      if (timeDiff < 0) {
        // Add 24 hours (in MSD format) to handle negative differences
        timeDiff += 24 * 60;
      }
  
      const hourDiff = Math.floor(timeDiff / 60);
      const minuteDiff = timeDiff % 60;
  
      const formattedDiff = `${hourDiff.toString().padStart(2, '0')}h${minuteDiff.toString().padStart(2, '0')}m`;
      return formattedDiff;
    });
  
    time = timeDifferences;
  } else {
    console.log("Start or end array is empty");
  }
  
  // console.log(time, "timesssss");


  const stTime = Array.isArray(dutySt) ? dutySt.map((date) => {
    const msdDate = convertTimeToMSD(new Date(date));
  
    const hours = String(msdDate.getHours()).padStart(2, '0');
    const minutes = String(msdDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${hours}:${minutes}`;
  
    return formattedDate;
  }) : [];

  // console.log(stTime,"stttttime")
 

  const endTime = Array.isArray(dutyEnd) ? dutyEnd.map((date) => {
    const msdDate = convertTimeToMSD(new Date(date));
  
    const hours = String(msdDate.getHours()).padStart(2, '0');
    const minutes = String(msdDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${hours}:${minutes}`;
  
    return formattedDate;
  }) : [];


  let fdp = [];

if (stTime.length > 0 && endTime.length > 0) {
  const fdpDifferences = stTime.map((startTime, index) => {
    const startMSD = convertToMSD(startTime);
    const endMSD = convertToMSD(endTime[index]);

    let timeDiff = endMSD - startMSD;

    if (timeDiff < 0) {
      // Add 24 hours (in MSD format) to handle negative differences
      timeDiff += 24 * 60;
    }

    const hourDiff = Math.floor(timeDiff / 60);
    const minuteDiff = timeDiff % 60;

    const formattedDiff = `${hourDiff.toString().padStart(2, '0')}h${minuteDiff.toString().padStart(2, '0')}m`;
    return formattedDiff;
  });

  fdp = fdpDifferences;
} else {
  console.log("Start or end array is empty in fdp");
}

// console.log(fdp, "fdp");

const convertDateTimeFormat = (dateTime) => {
  if (!dateTime) {
    // Return null if dateTime is empty or null
    return null;
  }

  const dateObj = new Date(dateTime);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${day}${month}${hours}:${minutes}`;
};
const formattedPatternStTime = convertDateTimeFormat(dutySt);
const formattedPatternEndTime = convertDateTimeFormat(dutyEnd);

  return (
    <View style={styles.container}>
    {isLoading?(
      <View style={styles.loadingContainer}>
          <Text>Data Loading....</Text>
        </View>
    ):(
      <>

      <View style={styles.row}>
      <View style={styles.icon}>
      {flightNo.startsWith('FY') || (flightNo === "S1") || (flightNo === "S2") || (flightNo === "S3") ?(
        <Ionicons name="airplane" size={24} />
      ):(flightNo === "OFF") ||  (flightNo === "AL") || (flightNo === "LEAVE") || (flightNo === "SICK") ? (
        <Ionicons name="home" size={24} />
      ):(
        <Ionicons name="desktop" size={24} />
      )}
      </View>
        <View style={styles.box}>
          <Text style={styles.flight}>{flightNo}</Text>
        </View>


      <View style={styles.dot}>
     <TouchableOpacity 
        onPress={openData}
        style={styles.box}>
          <Text>
          <Entypo name="dots-three-vertical" size={21} />
          </Text>
        </TouchableOpacity>     
        {dataVisible && (
          <TotalData
            data={JSON.stringify(tData)}
            onClose={closeData}
            flightNo={tableFlightNo}
            airCraftType={airCraftType}
            startFrom={departure}
            endsAt={arrival}
            tablesstart={start}
            tablesend={end}
            block={time}
            fdp={fdp}
            flightDate={flightDates}
          />
        )}
        </View>

      </View>

      <View style={styles.row}>
      <View style={styles.box}>
      <Text style={styles.text}>{startFrom}</Text>
    </View> 
    <View style={styles.box}>
      <Text style={styles.dutyCountText}>{'.'.repeat(dutyCount)}<Ionicons name="play-sharp" size={24} /></Text>
    </View>
    <View style={[styles.box]}>
    <Text style={styles.text}>{endsAt}</Text>
  </View>
  <View style={[styles.box]}>
  <Text style={[styles.text, styles.dateText]}>
  {flightNo.startsWith("AL") || (flightNo.startsWith("LEAVE")) || (flightNo.startsWith("SICK")) || (flightNo.startsWith("OFF"))? (
    <Text>{flightDates}</Text>
  ) : (
    <>
      {formattedPatternStTime ? (
        <Text>{formattedPatternStTime}</Text>
      ) : (
        <Text>..</Text>
      )} -
      {formattedPatternEndTime ? (
        <Text>{formattedPatternEndTime}</Text>
      ) : (
        <Text>..</Text>
      )}
    </>
  )}
</Text>
  </View>
      </View>

      </>
      
    )}
     
    </View>
  );
};

export default TomorrowMSD;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  mc:{
    justifyContent:'flex-end',
    alignItems:'flex-end'

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  box: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flight:{
    fontSize: 16,
    fontWeight: 'bold',
    color:'black',

  },
  emptyBox: {
    flex: 1,
  },
  button: {
    backgroundColor: 'gray',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dot:{
    justifyContent:'flex-end',
    alignItems:'flex-end',
    flex:1

  },
  
  
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  dutyCountText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'black',
  },
  icon:{
    marginRight:10,
    color:'black',
    fontWeight: 'bold',
  },
  rows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', 
  },
  closeText: {
    fontWeight: 'bold',
  },
  buttonAdded:{
    backgroundColor:'#CD6155',
   
  }
  
  
});
