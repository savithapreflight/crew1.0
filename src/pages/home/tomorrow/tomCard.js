import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import {_colors} from '../../../css/colors';
import useDefaultTheme from '../../../hooks/useDefaultTheme';
import { openDatabase } from 'react-native-sqlite-storage';
import { useState } from 'react';
import { useEffect } from 'react';
import TotalData from './totalData';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { getRosterDetailsApi } from '../../../api/roster/rosterDetailsApi';
import { initializeDatabaseStructure } from '../../../db/initializeDatabaseStructure';
import { useNavigation } from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

getRosterDetailsApi();
initializeDatabaseStructure();

const navigation=useNavigation(); 


const FlightCards = () => {
  const [flightNo, setFlightNo] = useState('');
  const [startFrom, setStartFrom] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [patternStTime, setPatternStTime] = useState('');
  const [patternEndTime, setPatternEndTime] = useState('');
  const [tdata,setTData] = useState('');
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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedIns, setIsCheckedIns] = useState(false);
  const [isCIClicked, setIsCIClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [isCoordinatesAdded, setIsCoordinatesAdded] = useState(false);
  const [isCoordinatesAddedOut, setIsCoordinatesAddedOut] = useState(false);
  const [isRepInSet, setIsRepInSet] = useState(false);
  const [isRepOutSet, setIsRepOutSet] = useState(false);
  const [PatternNo,setPatternNo] = useState('');
  const [crewCodes,setCrewCodes] = useState('');
  const[starts,setStarts] = useState('');
  const [ends,setEnds] = useState('')

  // const {auth, profile} = useSelector(state => state);

  var db = openDatabase({ name: 'CrewportDatabase.db' });

  const fetchData = async() => {
  
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT crewCode, crewDesig, flightDate, patternNo, flightNo, deptTime, arrTime, startFrom, endsAt,
          flightFrom, flightTo, restPeriod, aircraftType, patternStTime, patternEndTime, id, isVoilated, voilationReason,
          reptIn, reptOut, createdDate, modifiedDate FROM roster_details
          WHERE date(flightDate) = date('now', '+1 day', 'localtime');
   `,
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              const { flightNo, startFrom, endsAt, patternStTime, patternEndTime } = results.rows.item(0);
              const data = results.rows.raw();
              setTData(data);
              const aircraftType = Array.from((results.rows.raw().map(item => item.aircraftType)));
              const departures = Array.from((results.rows.raw().map(item => item.flightFrom)));
              const arrivals = Array.from((results.rows.raw().map(item => item.flightTo)));
              const starts = Array.from((results.rows.raw().map(item => item.deptTime)));
              const ends = Array.from((results.rows.raw().map(item => item.arrTime)));  
              const stduty=Array.from(new Set(results.rows.raw().map(item => item.patternStTime)));  
              // console.log(stduty,"stduty")
              const enduty = Array.from(new Set(results.rows.raw().map(item => item.patternEndTime)));  
              const flightDate = Array.from(new Set(results.rows.raw().map(item => item.flightDate)));         
              const flightNumbers = Array.from(new Set(results.rows.raw().map(item => item.flightNo)));
              const patternno = Array.from(new Set(results.rows.raw().map(item=>item.patternNo)));
              const crewcode = Array.from(new Set(results.rows.raw().map(item=>item.crewCode)));
              setPatternNo(patternno);
              setStarts(startFrom);
              setEnds(endsAt)
              setCrewCodes(crewcode);
              setDutyCount(flightNumbers.length);                
              setAirCraftType(aircraftType)            
              setFlightNo(flightNo);
              setStartFrom(startFrom);
              setEndsAt(endsAt);
              setPatternStTime(patternStTime);
              setPatternEndTime(patternEndTime);
              setTableStart(starts);
              setTableEnd(ends);
              setDutySt(stduty);
              setDutyEnd(enduty);
              setTableFlightNo(flightNumbers);
              setDeparture(departures);
              setArrival(arrivals);
              setFlightDates(flightDate)
            }
            resolve();
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    }).catch((error) => {
      console.log(error);
    });
  }; 

 
  
  
  useEffect(() => {
  //   const empCode = profile.data.personal.empCode
  // console.log(empCode,"personalll home tomcard")
     fetchData();
  
     getRosterDetailsApi();
  }, []);


  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulating a 10-second delay using setTimeout (replace this with your data-fetching logic)
        setTimeout(() => {
          setIsLoading(false); // Once the data is loaded, set isLoading to false
        }, 10000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false); // In case of an error, set isLoading to false
      }
    };

    fetchData(); // Call the fetch data function on component mount
  }, []);


  
  
  const openData =()=>{
    setDataVisible(true);
  };
 
  const closeData=()=>{
    setDataVisible(false);
  }


  


  const start = Array.isArray(tableStart) ? tableStart.map((date) => {
    const formattedDate = new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formattedDate;
  }) : [];

 

  const end = Array.isArray(tableEnd) ? tableEnd.map((date) => {
    const formattedDate = new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    
    });
    return formattedDate;
  }) : [];
  // console.log(end,"endsss")

  let time=[];


  if (start.length > 0 && end.length > 0) {
    const timeDifferences = start.map((startTime, index) => {
      const startSplit = startTime.split(':');
      const endSplit = end[index].split(':');
      if (startSplit.length === 2 && endSplit.length === 2) {
        const startHours = parseInt(startSplit[0]);
        const startMinutes = parseInt(startSplit[1]);
        const endHours = parseInt(endSplit[0]);
        const endMinutes = parseInt(endSplit[1]);
  
        let hourDiff = endHours - startHours;
        let minuteDiff = endMinutes - startMinutes;
  
        if (minuteDiff < 0) {
          hourDiff--;
          minuteDiff += 60;
        }
        if (hourDiff < 0) {
          hourDiff += 24; // Assuming a 24-hour clock
        }
  
        const formattedDiff = `${(hourDiff < 0 ? '-' : '')}${Math.abs(hourDiff).toString().padStart(2, '0')}h${Math.abs(minuteDiff).toString().padStart(2, '0')}m`;
        return formattedDiff;
      } else {
        return "Invalid time";
      }
    });
  
    time = timeDifferences;
  } else {
    console.log("Start or end array is empty");
  }
  


  const stTime = Array.isArray(dutySt) ? dutySt.map((date) => {
    const formattedDate = new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formattedDate;
  }) : [];
  // console.log(stTime,'dutySt')

  const endTime = Array.isArray(dutyEnd) ? dutyEnd.map((date) => {
    const formattedDate = new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    
    });
    return formattedDate;
  }) : [];
  // console.log(endTime,"dutyEnd")

  let fdp=[];

  
  if (stTime.length > 0 && endTime.length > 0) {
    const timeDifferencess = stTime.map((startTime, index) => {
      const startSplit = startTime.split(':');
      const endSplit = endTime[index].split(':');
      if (startSplit.length === 2 && endSplit.length === 2) {
        const startHours = parseInt(startSplit[0]);
        const startMinutes = parseInt(startSplit[1]);
        const endHours = parseInt(endSplit[0]);
        const endMinutes = parseInt(endSplit[1]);
  
        let hourDiff = endHours - startHours;
        let minuteDiff = endMinutes - startMinutes;
  
        if (minuteDiff < 0) {
          hourDiff--; // Adjust hours
          minuteDiff += 60;
        }
  
        // If the end time is on the next day, add 24 hours to the hour difference
        if (hourDiff < 0) {
          hourDiff += 24;
        }
  
        let formattedHourDiff = hourDiff.toString().padStart(2, '0') + 'h';
        let formattedMinuteDiff = minuteDiff.toString().padStart(2, '0') + 'm';
  
        return formattedHourDiff + formattedMinuteDiff;
      } else {
        return "Invalid time";
      }
    });
  
    fdp = timeDifferencess;
  } else {
    console.log("Start or end array is empty is fdp");
  }

  
  const convertDateTimeFormat = (dateTime) => {
    if (!dateTime) {
      
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
  console.log(formattedPatternStTime,"patterst")
  const formattedPatternEndTime = convertDateTimeFormat(dutyEnd);

  return (
    <View style={styles.container}>
    {isLoading?(
      <View style={styles.loadingContainer}>
      <Text>Data Loading....</Text>
    </View>
    ):(
      <>

      <View style={styles.rows}>
      <View style={styles.icon}>
      {flightNo.startsWith('FY') || (flightNo.startsWith('S3')) || (flightNo.startsWith('S2')) || (flightNo.startsWith('S1')) ?(
        <Ionicons name="airplane" size={24} />
      ):(flightNo === "OFF")||  (flightNo === "AL") || (flightNo === "LEAVE") ? (
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
        {dataVisible && 
          <TotalData
            data={JSON.stringify(tdata)}
            onClose={closeData}   
            flightNo={tableFlightNo}   
            airCraftType={airCraftType}  
            startFrom = {departure}
            endsAt={arrival} 
            tablesstart={start}
            tablesend={end}
            block={time}
            fdp={fdp}
            flightDate = {flightDates}
          />
        }   
        </View>      
        </View>
        <View style={styles.rows}>
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
  {flightNo.startsWith("AL") || (flightNo.startsWith("LEAVE")) || (flightNo.startsWith("SICK")) || (flightNo.startsWith("OFF")) ? (
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

export default FlightCards;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
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
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  boxs:{
    padding: 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    

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
  dot:{
    justifyContent:'flex-end',
    alignItems:'flex-end',
    flex:1
  }
  
  
});

