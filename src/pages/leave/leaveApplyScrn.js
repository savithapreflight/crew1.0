import {StyleSheet, Switch, TouchableOpacity, View,Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text, Block, TextInput, Dropdown, Button} from '../../components';
import useDefaultTheme from '../../hooks/useDefaultTheme';
import {Picker} from '@react-native-picker/picker';
import dayjs from 'dayjs';
import SQLite from 'react-native-sqlite-storage';
import { getleaveType } from '../../api/leave/leaveType';
import { getleaveReq } from '../../api/leave/leaveReq';
import { sendLeaveRequestToApi } from '../../api/api';
import { sendDataWhenOnline } from './dataonline';
import axios from 'axios';


const LeaveApplyScrn = () => {
  getleaveType();
  const {sizes, colors} = useDefaultTheme();
  const [leaveType, setleaveType] = useState('');
  const [fromDate, setfromDate] = useState(null); // Initialize with null instead of undefined
const [toDate, settoDate] = useState(null); // Initialize with null instead of undefined

  const [reason, setreason] = useState();
  const [showFromCalender, setshowFromCalender] = useState(false);
  const [showToCalender, setshowToCalender] = useState(false);
  const [comments, setComments] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [toggleValue, setToggleValue] = useState(false);
  const [toggleValues, setToggleValues] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
const [submitMessageType, setSubmitMessageType] = useState('');

  const [errorMsg,setErrorMsg] = useState(null);
  const [errors, setErrors] = useState({
    leaveType: false,
    fromDate: false,
    toDate: false,
    reason: false,
  });



  
  useEffect(() => {
    // console.log('Fetching data...'); 
    const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });
    const fetchData = async () => {
      try {
        const empDesign = await AsyncStorage.getItem('@empdesigns');
        // console.log(empDesign, "empDesign leave_types");
        const requestingEmployeeId = await AsyncStorage.getItem('@empnames');
        // console.log(requestingEmployeeId,"emp names ")
        const genders = await AsyncStorage.getItem('@genders');
        // console.log(genders,"genders")
        db.transaction(tx => {
          tx.executeSql(
            'SELECT id, type, description, noOfDays, maxSlot, gender, startValidityDays, carryForwardDays, designation from leave_types WHERE designation = ? AND (gender = ? OR gender = "")',
            [empDesign, genders === 'MALE' ? '' : 'F'],
            (_, result) => {
              const len = result.rows.length;
              const tempLeaveTypes = [];
              const uniqueLeaveTypes = new Set();
              for (let i = 0; i < len; i++) {
                const row = result.rows.item(i);
                uniqueLeaveTypes.add(row);
              }
  
              const uniqueLeaveTypesArray = Array.from(uniqueLeaveTypes);
              setLeaveTypes(uniqueLeaveTypesArray);
  
              // if (uniqueLeaveTypesArray.length > 0) {
              //   setSelectedLeaveType(`${uniqueLeaveTypesArray[0].id}.${uniqueLeaveTypesArray[0].type}`);
              // }

              if (uniqueLeaveTypesArray.length > 0) {
                setSelectedLeaveType(null); // Set it to null here
              }

            
              
            },
           
          );
        });
      } catch (error) {
        console.log('Error retrieving empDesign from AsyncStorage:', error);
      }
    };
  
    fetchData();
  }, []);

  
  
  const saveToDatabase = async () => {
    // console.log('From Date:', fromDate);
    // console.log('To Date:', toDate);

    let formValid = true;
    let errorMessage = '';
    setErrorMsg('');
    setSubmitMessage('');
    setSubmitMessageType('');
  
    if (!selectedLeaveType || selectedLeaveType === null) {
      setErrors((prevState) => ({ ...prevState, leaveType: true }));
      formValid = false;
      errorMessage += 'Leave type, ';
    } else {
      setErrors((prevState) => ({ ...prevState, leaveType: false }));
    }
  
    if (!fromDate) {
      setErrors((prevState) => ({ ...prevState, fromDate: true }));
      formValid = false;
      errorMessage += 'From date, ';
    } else {
      setErrors((prevState) => ({ ...prevState, fromDate: false }));
    }
  
    if (!toDate) {
      setErrors((prevState) => ({ ...prevState, toDate: true }));
      formValid = false;
      errorMessage += 'To date, ';
    } else {
      setErrors((prevState) => ({ ...prevState, toDate: false }));
    }
  
    if (!comments) {
      setErrors((prevState) => ({ ...prevState, reason: true }));
      formValid = false;
      errorMessage += 'Reason, ';
    } else {
      setErrors((prevState) => ({ ...prevState, reason: false }));
    }
  
    if (!formValid) {
      errorMessage = errorMessage.slice(0, -2); // Remove the trailing comma and space
      // Alert.alert(`Please fill the fields: ${errorMessage}!`);
      setErrorMsg(`Please fill the fields: ${errorMessage}!`)
      return;
    }

   
    if (formValid) {
      const today = dayjs().format('YYYY-MM-DDTHH:mm:ss');
      let startDate = dayjs(fromDate);

      if (toggleValues) {
        startDate = startDate.set('hour', 12).set('minute', 0).set('second', 0);
      } else {
        startDate = startDate.set('hour', 0).set('minute', 0).set('second', 0);
      }

      let endDate = dayjs(toDate);

if (toggleValue) {
  endDate = endDate.set('hour', 12).set('minute', 0).set('second', 0);
} else {
  endDate = endDate.set('hour', 0).set('minute', 0).set('second', 0);
}

      
  
      const leaveTypeId = selectedLeaveType.split('.')[0];
      const type = selectedLeaveType.split('.')[1];
      const dateRequested = today;
      const requestComments = comments;
      const isApproved = '0'; // Always post '0'
      const adminComments = '';
      const employeeName = await AsyncStorage.getItem('@empnames');
      // console.log(employeeName, "emp names");
  
      const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });
  
      // Check if the same employee has already applied for leave on the given dates
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM leave_request WHERE employeeName = ? AND startDate = ?',
          [employeeName, startDate.format('YYYY-MM-DDTHH:mm:ss')],
          (_, result) => {
            const existingRecordsCount = result.rows.length;
      
            if (existingRecordsCount > 0) {
              console.log('Leave request already exists for the same start date and employee.');
              setSubmitMessage('Leave request already exists for the same start date and employee.');
              setSubmitMessageType('error');
            } else {
              // If no existing record found, proceed with the insertion
              tx.executeSql(
                'INSERT INTO leave_request (startDate, endDate, id, type, dateRequested, requestComments, isApproved, adminComments, employeeName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [startDate.format('YYYY-MM-DDTHH:mm:ss'), endDate.format('YYYY-MM-DDTHH:mm:ss'), leaveTypeId, type, dateRequested, requestComments, isApproved, adminComments, employeeName],
                (_, result) => {
                  // ... existing code
                  setSubmitMessage('Leave request submitted successfully!');
                  setSubmitMessageType('success');
                },
                (_, error) => {
                  console.error('Error submitting leave request:', error);
                  setSubmitMessage('Error submitting leave request. Please try again.');
                  setSubmitMessageType('error');
                }
              );
            }
          },
          (_, error) => {
            console.error('Error checking existing leave request:', error);
            setSubmitMessage('Error checking existing leave request. Please try again.');
            setSubmitMessageType('error');
          }
        );
      });
  
      setleaveType('');
      setfromDate(null);
      settoDate(null);
      setComments('');
      setToggleValue(false);
      setToggleValues(false);
      setSelectedLeaveType(null);
    }
  };
  
 
 useEffect(() => {
  // Fetch start dates from the database and update the state
  const fetchStartDates = async () => {
    const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });

    try {
      const employeeName = await AsyncStorage.getItem('@empnames');
      const queryPromise = new Promise((resolve, reject) => {
        db.transaction(
          tx => {
            tx.executeSql(
              'SELECT startDate FROM leave_request WHERE employeeName = ?',
              [employeeName],
              (_, result) => {
                const len = result.rows.length;
                const dates = [];
                for (let i = 0; i < len; i++) {
                  const row = result.rows.item(i);
                  dates.push(new Date(row.startDate));
                }
                setHighlightedDates(dates);
                resolve(dates);
              },
              (_, error) => {
                console.error('Error fetching start dates:', error);
                reject(error);
              }
            );
          },
          (error) => {
            if (error) {
              console.error('Transaction failed:', error);
              reject(error);
            }
          },
          () => {
            console.log('Transaction successful');
          }
        );
      });

      const dates = await queryPromise;
      // console.log('Fetched Start Dates:', dates);
      setHighlightedDates(dates);
    } catch (error) {
      console.error('Error in fetchStartDates:', error);
    }
  };

  fetchStartDates();
}, []);

 

  const _onChange = ({key, data}) => {
    const fun = {
      reason: txt => setreason(txt),
    };
    fun[key](data);
  };
  

  const _onPress = ({ key, data }) => {
    const today = new Date();
  
    const fun = {
      from: () => {
        if (data <= today) {
          // Check if the selected date is already a start date
          if (highlightedDates.some(d => dayjs(d).isSame(data, 'day'))) {
            // Highlight the selected date in red and show an alert
            setHighlightedDates([...highlightedDates, data]);
            setfromDate(data);
            setshowFromCalender(false);
            Alert.alert("This date is already selected as a start date.");
          } else {
            setfromDate(data);
            setHighlightedDates([...highlightedDates, data]);
            setshowFromCalender(false);
          }
        }
      },
      to: () => {
        if (fromDate && data >= today && data >= fromDate) {
          settoDate(data);
          console.log("Selected 'To' date:", data);
          const oneDay = 24 * 60 * 60 * 1000;
          const diffInTime = Math.abs(data.getTime() - fromDate.getTime());
          const diffInDays = Math.round(diffInTime / oneDay) + 1;
          console.log("Number of days:", diffInDays);
        } else {
          console.log("Invalid 'To' date. Select a date in the future with respect to the 'From' date.");
          alert("Invalid 'To' date. Select a date in the future with respect to the 'From' date.");
          return;
        }
        setshowToCalender(false);
      },
    };
  
    if (key === 'from') {
      setshowFromCalender(true);
    } else if (key === 'to') {
      if (fromDate) {
        if (data <= today || data < fromDate) {
          console.log("Invalid 'To' date. Select a date in the future with respect to the 'From' date.");
          alert("Invalid 'To' date. Select a date in the future with respect to the 'From' date.");
          return;
        }
      }
      setshowToCalender(true);
    }
  };
  
 

  const calculateDays = () => {
    if (fromDate && toDate) {
      const start = dayjs(fromDate);
      const end = dayjs(toDate);
      if (start.isSame(end, 'day')) {
        if (toggleValues || toggleValue) {
          return 0.5;
        } else {
          return 1; 
        }
      } else {
        let diff = end.diff(start, 'day');
        if (toggleValues) {
          diff -= 0.5; 
        }
        if (toggleValue) {
          diff -= 0.5; 
        }
        return diff + 1; 
      }
    } else {
      return 0; 
    }
  };
  
  
 
  const daysDifference = calculateDays();
  console.log('Number of days:', daysDifference);
  
  const getMarkedDates = (dates) => {
    const markedDates = {};
    dates.forEach(date => {
      markedDates[dayjs(date).format('YYYY-MM-DD')] = { marked: true, dotColor: 'orange' };
    });
    return markedDates;
  };
  

  useEffect(() => {
    getleaveType();
    getleaveReq();
  }, []);

  return (
    <Block light container padding>
      <Block scroll>
      <Block>
      <Text p textAlign="center">
        Leave type
      </Text>
      <Dropdown
      style={{
        borderColor: errors.leaveType ? 'red' : 'transparent'
      }}
      borderRadius
      marginVertical={sizes.xs}
      height={45}
      white
    >
      <Picker
        selectedValue={selectedLeaveType !== null ? selectedLeaveType : undefined}
        onValueChange={(itemValue) => {
          setSelectedLeaveType(itemValue);
        }}
      >
        <Picker.Item label="--Select Leave Type--" value={null} />
        {leaveTypes.map((row, index) => (
          <Picker.Item key={index} label={row.type} value={`${row.id}.${row.type}`} />
        ))}
      </Picker>
    </Dropdown>

    </Block>

        <Block marginVertical={sizes.xs}
        style={{
          borderColor: errors.fromDate ? 'red' : 'transparent'
        }}>
          <Text p textAlign="center">
            From
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <View style={{ flex: 0.7 }}>
    <Button
      radius
      primary
      marginVertical
      onPress={() => _onPress({ key: 'from' })}
    >
      <Text p white>
        {fromDate ? dayjs(fromDate).format('DD-MM-YYYY') : `Pick "From" date`}
      </Text>
    </Button>
  </View>

  <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>{toggleValues ? 'Half-Day' : 'Full-Day'}</Text>
      <Switch
        onValueChange={(value) => setToggleValues(value)}
        value={toggleValues}
      />
    </View>
  </View>
</View>


      </Block>
      <Block
      style={{
        borderColor: errors.toDate ? 'red' : 'transparent'
      }}
       marginVertical={sizes.xs}>
      <Text p textAlign="center">
        To
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 0.7 }}>
          <Button radius primary onPress={() => _onPress({ key: 'to' })}>
            <Text p white>
              {fromDate ? dayjs(toDate).format('DD-MM-YYYY') : `Pick "To" date`}
            </Text>
          </Button>
        </View>
        <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{toggleValue ? 'Half-Day' : 'Full-Day'}</Text>
            <Switch
              onValueChange={(value) => setToggleValue(value)}
              value={toggleValue}
              // disabled={!toDate}
              disabled={!toDate || dayjs(fromDate).isSame(dayjs(toDate), 'day')}
            />
          </View>
        </View>
      </View>
    </Block>
    
        
        
        <Block
        style={{
          borderColor: errors.reason ? 'red' : 'transparent'
        }}
        className={errors.reason ? 'error' : ''}
         marginVertical={sizes.xs}>
          <Text p textAlign="center">
            Reason
          </Text>
          <TextInput
            borderRadius
            textArea
            h5
            row
            white
            border={0}
            alignItems="center"
            placeholder="Ex: Planning for vaction"
            marginVertical={sizes.xs}
            // onChangeText={txt => _onChange({key: 'reason', data: txt})}
            onChangeText={txt => setComments(txt)}
            style={{
              borderColor: errors.reason ? 'red' : colors.white,
              borderWidth: 1,
              paddingHorizontal: 10, // You can adjust the padding as needed
              paddingVertical: 8, // You can adjust the padding as needed
              marginTop: 8,
              borderRadius: 5,
            }}
          />
        </Block>
        {showFromCalender && (
          <DateTimePicker
            testID="dateTimePicker"
            value={fromDate || new Date()}
            mode={'date'}
            minimumDate={new Date()}
            disabled={(date) => highlightedDates.some(d => dayjs(d).isSame(date, 'day'))}
            markedDates={{
              ...getMarkedDates(highlightedDates),
              [dayjs(fromDate).format('YYYY-MM-DD')]: { selected: true, marked: true, selectedColor: 'orange' },
            }}
            onChange={(e, date) => {
              if (date !== undefined) {
                // Check if the selected date is already a start date
                if (highlightedDates.some(d => dayjs(d).isSame(date, 'day'))) {
                  // Highlight the selected date without showing an alert
                  setfromDate(date);
                  setshowFromCalender(false);
                  return;
                }
              }
              setfromDate(date);
              setshowFromCalender(false);
            }}
          />
        )}
        
        
        
        {showToCalender && (
          <DateTimePicker
            testID="dateTimePicker"
            value={toDate || new Date()}
            mode={'date'}
            minimumDate={fromDate || new Date()}
            onChange={(e, date) => {
              if (date !== undefined) {
                settoDate(date);
                const diffInTime = date.getTime() - fromDate.getTime();
                const diffInDays = diffInTime / (1000 * 3600 * 24);
                console.log("Number of days:", diffInDays);
              }
              setshowToCalender(false);
            }}
          />
        )}
        
        
      </Block>
      {errorMsg && (
        <Text style={{color:'red'}}>{errorMsg}</Text>
      )}
      {submitMessage && (
        <Text style={{ color: submitMessageType === 'success' ? 'green' : 'red' }}>{submitMessage}</Text>
      )}
      
      <Button
      radius
      primary
      marginTop
      onPress={saveToDatabase} // Removed the nested TouchableOpacity
    >
      <Text p white>{`Submit`}</Text>
    </Button>
    
    </Block>
  );
};

export default LeaveApplyScrn;

const styles = StyleSheet.create({});
