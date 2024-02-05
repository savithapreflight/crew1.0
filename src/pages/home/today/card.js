import {Image, StyleSheet, Text, View, TouchableOpacity, Alert, Button, ActivityIndicator} from 'react-native';
import React from 'react';
import {_colors} from '../../../css/colors';
import useDefaultTheme from '../../../hooks/useDefaultTheme';
import { openDatabase } from 'react-native-sqlite-storage';
import { useState } from 'react';
import { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Data from './data';
import { getRosterDetailsApi } from '../../../api/roster/rosterDetailsApi';
import { initializeDatabaseStructure } from '../../../db/initializeDatabaseStructure';
import { useNavigation } from '@react-navigation/native';
import { personalDetailsApi } from '../../../api/user/userDetailsApi';
import { addPersonalDetailsReducer } from '../../../redux/slices/profileSlice';
import PushNotification from 'react-native-push-notification';
import BackgroundTimer from 'react-native-background-timer';
import { useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletecheck } from '../../../db/deleteTable';



var db = openDatabase({ name: 'CrewportDatabase.db' });

const createChannels = () => {
  PushNotification.createChannel({
    channelId: 'Crew-Port',
    channelName: 'Crewport Channel',
  });
  // console.log('channel created card today');
};
  
const FlightCard = () => {
  // deletecheck();
  
  useEffect(() => {
    const initializeDatabase = async () => {
      await getRosterDetailsApi();
      // deletecheck();
      createChannels();
      await initializeDatabaseStructure();
    };
  
    initializeDatabase();
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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCoordinatesAdded, setIsCoordinatesAdded] = useState(false);
  const [isCoordinatesAddedOut, setIsCoordinatesAddedOut] = useState(false);
  const [isRepInSet, setIsRepInSet] = useState(false);
  const [isRepOutSet, setIsRepOutSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [PatternNo,setPatternNo] = useState('');
  const [crewCodes,setCrewCodes] = useState('');
  const[starts,setStarts] = useState('');
  const [ends,setEnds] = useState('');
  const [isCheckInDone, setIsCheckInDone] = useState(false);
  const [isCheckInSuccessful, setIsCheckInSuccessful] = useState(false);
  const [isCIDataAvailable, setIsCIDataAvailable] = useState(false);
const [isRIDataAvailable, setIsRIDataAvailable] = useState(false);
const [isRODataAvailable, setIsRODataAvailable] = useState(false);
const [isBlinking, setIsBlinking] = useState(true);
const [cIsuccess,setCISuccess] = useState('');
const [rIsuccess,setRISuccess] = useState('');
const [rOsuccess,setROSuccess] = useState('');
const [cIerror,setCIError] = useState('');
const [rIerror,setRIError] = useState('');
const [rOerror,setROError] = useState('');



  const navigation=useNavigation();


  const requestLocationPermission = async () => {
    try {
      let permission = await AsyncStorage.getItem('locationPermission');
      if (permission !== null && permission === 'granted') {
        // console.log('Location permission previously granted');
        return permission;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log('Location permission granted');
          await AsyncStorage.setItem('locationPermission', 'granted'); // Store the permission status
          return granted;
        } else {
          console.log('Location permission denied');
          return granted;
        }
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    });
  };

  const checkLatitudeAndLongitude = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT repInLat, repInLng, repOutLat, repOutLng, repInTime, repOutTime FROM check_ins WHERE date(flightDate) = date('now')`,
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            const row = results.rows.item(0);
            // console.log('Query Result:', row);
  
            const repInLat = row.repInLat;
            const repInLng = row.repInLng;
            const repOutLat = row.repOutLat;
            const repOutLng = row.repOutLng;
  
            if (repOutLat && repOutLng) {
              console.log("Report Out Lat and Lng added Successfully", repOutLat, repOutLng);
              setIsRepOutSet(true);
            } else {
              console.log('Report Out not added');
              setIsRepOutSet(false);
            }
  
            if (repInLat && repInLng) {
              console.log('Latitude and Longitude added successfully:', repInLat, repInLng);
              setIsRepInSet(true);
            } else {
              console.log('Latitude and Longitude not added');
              setIsRepInSet(false);
            }
          } else {
            // console.log('No records found for the current date');
            setIsRepInSet(false);
            setIsRepOutSet(false);
          }
        },
        (error) => {
          console.log(error);
          setIsRepInSet(false);
          setIsRepOutSet(false);
        }
      );
    });
  };
  
  
  useEffect(() => {
    checkIfCheckedIn();
    checkLatitudeAndLongitude();
    checkIfRIDataAvailable();
    checkIfRODataAvailable();
  }, []);


  const updateRosterDetails = (column, value, latitude, longitude, time) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE check_ins SET ${column} = ?, repInLat = ?, repInLng = ?, repInTime = ? WHERE date(flightDate) = date('now')`,
        [value, latitude, longitude, time],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log(`Updated ${column} successfully`);
            setRISuccess('Reporting In done!');
            setIsCIDataAvailable(true); // Set state to indicate CI data is available
            AsyncStorage.setItem('locationPermission', 'granted');
            // Clear the error message after 1 minute
            setTimeout(() => setRISuccess(null), 15000);
          } else {
            console.log(`Failed to update ${column}`);
            setRIError('Failed to update Reporting In');
            // Clear the error message after 1 minute
            setTimeout(() => setRIError(null), 15000);
          }
        },
        (error) => {
          console.log(error);
          setRIError('Error updating Reporting In');
          // Clear the error message after 1 minute
          setTimeout(() => setRIError(null), 15000);
        }
      );
    });
  };
  


  const checkIfRIDataAvailable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT repInLat,repInLng,repInTime FROM check_ins WHERE date(flightDate) = date('now')`,
        [],
        (tx, results) => {
          const firstRow = results.rows.item(0);
          if (
            results.rows.length > 0 &&
            (firstRow.repInLat || firstRow.repInLng || firstRow.repInTime)
          ) {
            setIsRIDataAvailable(true);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };
  

  const getCurrentFormattedDateTime = () => {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
    // Format the date and time
    const formattedDate = currentTime.slice(0, 10);
    const hours = currentTime.slice(11, 13);
    const minutes = currentTime.slice(14, 16);
    const seconds = currentTime.slice(17, 19);
  
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    const formattedDateTime = `${formattedDate}T${formattedTime}`;
  
    return formattedDateTime;
  };
  
  const handleCheckInPress = async () => {
    if (!isCoordinatesAdded && (flightNo.startsWith('FY') || flightNo.startsWith('S1') || flightNo.startsWith('S2') || flightNo.startsWith('S3'))) {
      const locationPermission = await requestLocationPermission();
      if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const observedLocation = `${latitude},${longitude}`;
            AsyncStorage.getItem('observedLocation', async (error, result) => {
              if (result !== null && result === observedLocation) {
                console.log('RI done');
              } else {
                const formattedDateTime = getCurrentFormattedDateTime();
  
                // Call updateRosterDetails with formatted date and time
                await updateRosterDetails('repInLat', latitude, latitude, longitude, formattedDateTime);
                await updateRosterDetails('repInLng', longitude, latitude, longitude, formattedDateTime);
                await updateRosterDetails('repInTime', formattedDateTime, latitude, longitude, formattedDateTime);
  
                AsyncStorage.setItem('observedLocation', observedLocation);
                setIsCoordinatesAdded(true);
                setIsCheckInSuccessful(true);
                setIsRIDataAvailable(true);
                console.log('reporting in done');
              }
            });
          },
          (error) => {
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        console.log('Location permission denied');
      }
    } else if (isCoordinatesAdded) {
      console.log('You Have Already Entered Reporting In status!');
    }
  };
  
 
  
  const updateRosterDetailsOut = async (column, value, latitude, longitude, time) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE check_ins SET ${column} = ?, repOutLat = ?, repOutLng = ?, repOutTime = ? WHERE date(flightDate) = date(?)`,
          [value, latitude, longitude, time, 'now'],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              console.log(`Updated ${column} successfully`);
              resolve();
            } else {
              console.log(`Failed to update ${column}`);
              reject();
            }
          },
          (error) => {
            console.log(`SQL Error: ${error}`);
            reject();
          }
        );
      });
    });
  };
  
  
  
  const handleReportOut = async () => {
    if (isCoordinatesAddedOut) {
      console.log('handleReportOut - Already entered reporting out status');
      return;
    }
  
    if (!(flightNo.startsWith('FY') || flightNo.startsWith('S1') || flightNo.startsWith('S2') || flightNo.startsWith('S3'))) {
      console.log('handleReportOut - Flight number not valid for reporting out');
      return;
    }
  
    const locationPermission = await requestLocationPermission();
  
    if (locationPermission !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('handleReportOut - Location permission denied');
      return;
    }
  
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (position.coords) {
            const { latitude, longitude } = position.coords;
            const observedLocation = `${latitude},${longitude}`;
            const storedLocation = await AsyncStorage.getItem('observedLocation');
  
            if (storedLocation !== null && storedLocation === observedLocation) {
              console.log('RO done');
            } else {
              const formattedDateTime = getCurrentFormattedDateTime();
  
              await updateRosterDetailsOut('repOutLat', latitude, latitude, longitude, formattedDateTime);
              await updateRosterDetailsOut('repOutLng', longitude, latitude, longitude, formattedDateTime);
              await updateRosterDetailsOut('repOutTime', formattedDateTime, latitude, longitude, formattedDateTime);
  
              await AsyncStorage.setItem('observedLocation', observedLocation);
              setIsCoordinatesAddedOut(true);
              setIsRODataAvailable(true);
              console.log('Reporting Out Time:', formattedDateTime);
            }
          } else {
            console.log('position.coords is undefined');
          }
        } catch (error) {
          console.error('Error during handleReportOut:', error);
        }
      },
      (error) => {
        console.log('Geolocation Error:', error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
  
  

  const checkIfRODataAvailable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT repOutLat, repOutLng, repOutTime FROM check_ins WHERE date(flightDate) = date('now')`,
        [],
        (tx, results) => {
          const firstRow = results.rows.item(0);
          if (
            results.rows.length > 0 &&
            (firstRow.repOutLat || firstRow.repOutLng || firstRow.repOutTime)
          ) {
            setIsRODataAvailable(true);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };
  

  const updateRosterDetailsCheckIn = (flightDate, checkinTime, patternNo,departure,arrival,crewcode) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO check_ins (flightDate, checkinTime, patternno,Dep,Arrival,crewCode) VALUES (?, ?, ?, ?, ?, ?)`,
        [flightDate, checkinTime, patternNo,departure,arrival,crewcode],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log(`Insert into check_ins successful. Checkin Time: ${checkinTime}`);
            setCISuccess('Check IN done!')
            setTimeout(() => setCISuccess(null), 15000);
          } else {
            console.log('Failed to insert into check_ins');
            setCIError('Failed to Check IN')
            setTimeout(() => setCIError(null), 15000);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };
  

  const checkIfCheckedIn = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT checkinTime, patternno, Dep, Arrival, crewCode FROM check_ins WHERE date(flightDate) = date('now')`,
        [],
        (tx, results) => {
          const firstRow = results.rows.item(0);
  
          if (
            results.rows.length > 0 &&
            firstRow.checkinTime &&
            firstRow.patternno &&
            firstRow.Dep &&
            firstRow.Arrival &&
            firstRow.crewCode
          ) {
            // CheckinTime and all other specified columns have values, set the state to indicate check-in
            setIsCheckedIn(true);
          }
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };
  
  
  const handleCheckIn = async () => {
    try {
      if (isCheckedIn) {
        setCIError('Check In was done! Already');
      } else {
        const currentDateTime = new Date();
  
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3, // Include milliseconds (3 digits)
          hour12: false, // Use 24-hour format
        };
  
        const formattedDate = currentDateTime.toISOString().slice(0, 10);
  
        const hours = currentDateTime.getHours().toString().padStart(2, '0');
        const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
        const milliseconds = currentDateTime.getMilliseconds().toString().padStart(3, '0');
  
        const formattedTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  
        // console.log(formattedTime, "timesss");
  
        const formattedDateTime = `${formattedDate}T${formattedTime}`;
  
        // console.log('Formatted Time:', formattedDateTime);
  
        // Get the patternNo from the state
        const patternNo = PatternNo; // Replace with the state variable
        const crewcode = crewCodes;
        const depar = starts;
        const arriv = ends;
  
        // Call the function to update the check_ins table
        await updateRosterDetailsCheckIn(formattedDate, formattedDateTime, patternNo, depar, arriv, crewcode);
  
        // Update the isCheckedIn state based on the success of the check-in
        setIsCheckedIn(true);
        setIsCheckInDone(true);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      // Handle errors if necessary
      setIsCheckInDone(false);
    }
  };
  


  useEffect(() => {
    const targetTime = Array.isArray(tableStart) ? new Date(tableStart[0]) : null;
  
    if (targetTime) {
      // Calculate 4 hours before target time
      const fourHoursBefore = new Date(targetTime.getTime());
      fourHoursBefore.setHours(fourHoursBefore.getHours() - 12);
  
      // Calculate 50 minutes before target time
      const fiftyMinutesBefore = new Date(targetTime.getTime() - 50 * 60 * 1000);
  
      const currentTime = new Date();
  
      // Determine visibility and blinking based on time intervals
      if (currentTime >= fourHoursBefore) {
        // Show the CI button without blinking
        setVisible(true);
  
        if (currentTime >= fiftyMinutesBefore && !isCheckInDone) {
          // Implement blinking effect for "CI" button
          const intervalId = setInterval(() => {
            setIsBlinking((prevIsBlinking) => !prevIsBlinking);
          }, 1000);
  
          return () => clearInterval(intervalId);
        } else {
          // Stop blinking when CI data is available but keep the CI button visible
          setIsBlinking(false);
        }
      } else {
        // Hide the CI button
        setVisible(false);
      }
    }
  }, [tableStart, isCheckInDone]);
  


  const openData = ()=>{
    setDataVisible(true);
  };
  
  const closeData = ()=>{
    setDataVisible(false);
  }
  const fetchData = async() => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT crewCode, crewDesig, flightDate, patternNo, flightNo, deptTime, arrTime, startFrom, endsAt,
          flightFrom, flightTo, restPeriod, aircraftType, patternStTime, patternEndTime, id, isVoilated, voilationReason,
          reptIn, reptOut, createdDate, modifiedDate FROM roster_details WHERE date(flightDate) = date('now')`,
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
              setTableFlightNo(flightNumbers);
              setDeparture(departures);
              setArrival(arrivals);
              setDutySt(stduty);
              setDutyEnd(enduty);
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
    getRosterDetailsApi();
    createChannels();
    fetchData();
    checkLatitudeAndLongitude();
  requestLocationPermission();
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


  let time = [];

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
          hourDiff += 24; 
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
 

  const endTime = Array.isArray(dutyEnd) ? dutyEnd.map((date) => {
    const formattedDate = new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    
    });
    return formattedDate;
  }) : [];


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
      ):(flightNo === "OFF") || (flightNo === "LEAVE") || (flightNo === "SICK") ||  (flightNo === "AL") ? (
        <Ionicons name="home" size={24} />
      ):(
        <Ionicons name="desktop" size={24} />
      )}
      </View>
        <View style={styles.box}>
          <Text style={styles.flight}>{flightNo}</Text>
        </View>


        <View style={{ flexDirection: 'row' }}>
        {visible && (flightNo.startsWith('FY') || flightNo.startsWith('S3') || flightNo.startsWith('S2') || flightNo.startsWith('S1')) ? (
          <>
          <TouchableOpacity
          onPress={handleCheckIn}
          disabled={isCheckedIn} // Disable the button when isCheckedIn is true
          style={[
            styles.box,
            styles.button,
            { backgroundColor: isCheckedIn ? '#ACCB61' : 'gray' },
          ]}
        >
          <Text style={styles.buttonText}>
            {isCheckedIn ? (isCheckInDone ? 'CID' : 'CID') : 'CI'}
          </Text>
        </TouchableOpacity>

          </>
        ) : null}
        
   
            {isCheckInDone && (
              <TouchableOpacity
                onPress={handleCheckInPress}
                disabled={isRIDataAvailable}// Disable the button when isRIDataAvailable is true
                style={[
                  styles.box,
                  styles.button,
                  { marginLeft: 10 },
                  isRepInSet ? styles.buttonAdded : { backgroundColor: isRIDataAvailable ? '#ACCB61' : 'gray' },
                ]}
              >
                <Text style={styles.buttonText}>{isRepInSet ? 'RID' : 'RI'}</Text>
              </TouchableOpacity>
            )}
            
        
        
        {isRIDataAvailable && (
          <TouchableOpacity
            onPress={handleReportOut}
            // disabled={isRODataAvailable}
            style={[
              styles.box,
              styles.button,
              { marginLeft: 10 },
              isRepOutSet ? styles.buttonAdded : { backgroundColor: isRODataAvailable ? '#ACCB61' : 'gray' },
            ]}
          >
            <Text style={styles.buttonText}>{isRepOutSet ? 'ROD' : 'RO'}</Text>
          </TouchableOpacity>
        )}
        
        
        
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
          <Data
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
  {flightNo.startsWith("AL") || (flightNo.startsWith("LEAVE")) || (flightNo.startsWith("SICK"))  || (flightNo.startsWith("OFF"))? (
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
      <Text>
  <Text style={{ color: cIsuccess ? 'green' : 'red' }}>
    {cIsuccess ? cIsuccess : cIerror}
  </Text>
  <Text style={{ color: rIsuccess ? 'green' : 'red' }}>
    {rIsuccess ? rIsuccess : rIerror}
  </Text>
  <Text style={{ color: rOsuccess ? 'green' : 'red' }}>
    {rOsuccess ? rOsuccess : rOerror}
  </Text>
</Text>



      </>
    )}

    </View>
    
  );
};

export default FlightCard;

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
    backgroundColor:'#ACCB61 ',
   
  }
  
  
});
