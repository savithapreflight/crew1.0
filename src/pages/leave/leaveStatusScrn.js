import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, { useEffect } from 'react';
import {Block, Button, Text, Icons} from '../../components';
import useDefaultTheme from '../../hooks/useDefaultTheme';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useState } from 'react';
import SQLite from 'react-native-sqlite-storage';
import { getleaveReq } from '../../api/leave/leaveReq';
import { Row, Rows, Table } from 'react-native-table-component';

const LeaveStatusScrn = () => {
  const { sizes, colors } = useDefaultTheme();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [successMsg,setSuccessMsg] = useState('');
  const [errorMsg,setErrorMsg] = useState('');

  useEffect(() => {
    const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });

    const fetchData = async () => {
      await getleaveReq();
      try {
        const employeeName = await AsyncStorage.getItem('@empnames');
        console.log(employeeName, 'Employee Name');

        const startDateOfMonth = currentMonth.startOf('month').format('YYYY-MM-DD');
        const endDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');

        db.transaction((tx) => {
          tx.executeSql(
            'SELECT startDate, endDate, id, type, dateRequested, requestComments, adminComments, employeeName, isApproved, uploaded FROM leave_request WHERE employeeName = ? AND startDate >= ? AND startDate <= ?',
            [employeeName, startDateOfMonth, endDateOfMonth],
            (_, result) => {
              const uniqueStartDates = new Set();
              const leaveRequestsArray = [];

              for (let i = 0; i < result.rows.length; i++) {
                const item = result.rows.item(i);

                // Check if the start date is already in the Set
                if (!uniqueStartDates.has(item.startDate)) {
                  leaveRequestsArray.push(item);
                  uniqueStartDates.add(item.startDate);
                }
              }

              console.log('Leave Requests:', leaveRequestsArray);
              setLeaveRequests(leaveRequestsArray);
            },
            (_, error) => {
              console.error('Error executing SQL query status:', error);
            }
          );
        });
      } catch (error) {
        console.log('Error retrieving data from leave_status:', error);
      }
    };

    fetchData();
  }, [currentMonth]);

  const totalLeaveCount = leaveRequests.reduce((acc, request) => {
    const startDate = dayjs(request.startDate);
    const endDate = dayjs(request.endDate);
  
    // Check if the start date has time 12:00:00 (noon) or 00:00:00 (midnight)
    const isHalfDayStart = startDate.format('HH:mm:ss') === '12:00:00';
    const isFullDayStart = startDate.format('HH:mm:ss') === '00:00:00';
  
    // Check if the end date has time 12:00:00 (noon) or 00:00:00 (midnight)
    const isHalfDayEnd = endDate.format('HH:mm:ss') === '12:00:00' && !endDate.isSame(startDate, 'day');
    const isFullDayEnd = endDate.format('HH:mm:ss') === '00:00:00';
  
    // Calculate duration based on time
    let durationInDays = 0;
  
    if (isHalfDayStart) {
      // Start is at 12:00:00, consider it as a half-day
      durationInDays += 0.5;
    } else if (isFullDayStart) {
      // Start is at 00:00:00, consider it as a full day
      durationInDays += 1;
    }
  
    // Calculate full days between start and end dates
    durationInDays += endDate.diff(startDate, 'day', true);
  
    if (isHalfDayEnd) {
      // End is at 12:00:00, consider it as a half-day
      durationInDays += 0.5;
    } else if (isFullDayEnd) {
      // End is at 00:00:00, consider it as a full day
      durationInDays += 1;
    }
  
    // Log start date, end date, and total leave count for each request
    console.log('Start Date:', startDate.format('YYYY-MM-DD HH:mm:ss'));
    console.log('End Date:', endDate.format('YYYY-MM-DD HH:mm:ss'));
    console.log('Total Leave Count:', durationInDays);
  
    return acc + durationInDays;
  }, 0);
  
  
  const calculateDurationInDays = (request) => {
    const startDate = dayjs(request.startDate);
    const endDate = dayjs(request.endDate);
  
    // Check if the start date has time 12:00:00 (noon) or 00:00:00 (midnight)
    const isHalfDayStart = startDate.format('HH:mm:ss') === '12:00:00';
    const isFullDayStart = startDate.format('HH:mm:ss') === '00:00:00';
  
    // Check if the end date has time 12:00:00 (noon) or 00:00:00 (midnight)
    const isHalfDayEnd = endDate.format('HH:mm:ss') === '12:00:00' && !endDate.isSame(startDate, 'day');
    const isFullDayEnd = endDate.format('HH:mm:ss') === '00:00:00';
  
    // Calculate duration based on time
    let durationInDays = 0;
  
    if (isHalfDayStart) {
      // Start is at 12:00:00, consider it as a half-day
      durationInDays += 0.5;
    } else if (isFullDayStart) {
      // Start is at 00:00:00, consider it as a full day
      durationInDays += 1;
    }
  
    // Calculate full days between start and end dates
    durationInDays += endDate.diff(startDate, 'day', true);
  
    if (isHalfDayEnd) {
      // End is at 12:00:00, consider it as a half-day
      durationInDays += 0.5;
    } else if (isFullDayEnd) {
      // End is at 00:00:00, consider it as a full day
      durationInDays += 1;
    }
  
    return durationInDays;
  };
  
  

  const handleBlockClick = (request) => {
    setSelectedLeaveRequest(request);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedLeaveRequest(null);
  };


  const goToPreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };
 
  const cancelLeaveRequest = async (dateRequested) => {
    const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });
  
    db.transaction(async (tx) => {
      tx.executeSql(
        'SELECT dateRequested FROM leave_request WHERE dateRequested = ?',
        [dateRequested],
        async (_, result) => {
          if (result.rows.length > 0) {
            const canceledLeaveRequest = result.rows.item(0);
            console.log('Leave request canceled:', canceledLeaveRequest);
  
            // Retrieve authentication token from AsyncStorage
            const authData = await AsyncStorage.getItem('@auth');
  
            // Parse the JSON string into an object
            const authObject = JSON.parse(authData);
  
            // Extract the token from the object
            const token = authObject?.token;
  
            try {
              const apiUrl = 'http://20.204.102.191/LMS.API/LeaveRequest';
  
              const apiResponse = await fetch(apiUrl, {
                headers: {
                  Authorization: `Bearer ${token}`, // Add the authentication token to the Authorization header
                  // Other headers if needed
                },
              });
  
              if (!apiResponse.ok) {
                throw new Error(`HTTP error! Status: ${apiResponse.status}`);
              }
  
              const apiData = await apiResponse.json();
  
              const matchingLeave = apiData.find(
                (leave) => leave.dateRequested === canceledLeaveRequest.dateRequested
              );
  
              if (matchingLeave) {
                console.log('Matching API leave data:', matchingLeave);
  
                // Extract the ID from the matching leave
                const leaveId = matchingLeave.id;
  
                // Call the function to delete the leave request using the obtained ID
                await deleteLeaveRequest(leaveId);
  
                // Call the function to delete the leave request from the local database
                await deleteLeaveRequestFromDatabase(dateRequested);
  
                // Update the state to remove the canceled leave request
                setLeaveRequests((prevLeaveRequests) =>
                  prevLeaveRequests.filter(
                    (request) => request.dateRequested !== canceledLeaveRequest.dateRequested
                  )
                );
  
                console.log('Leave request canceled successfully');
                // Add any additional logic here, such as updating state or refreshing the screen
              } else {
                console.log('No matching leave found in API data');
                setErrorMsg('No Matching Data in Server');
              }
            } catch (error) {
              console.error('Error fetching data from the API:', error.message);
            }
          } else {
            console.log('Leave request not found for dateRequested:', dateRequested);
          }
        },
        (_, error) => {
          console.error('Error retrieving leave request for cancellation:', error);
        }
      );
    });
  };
  
  
  
  // Function to delete leave request by ID
  const deleteLeaveRequest = async (leaveId) => {
     // Retrieve authentication token from AsyncStorage
     const authData = await AsyncStorage.getItem('@auth');
  
     // Parse the JSON string into an object
     const authObject = JSON.parse(authData);

     // Extract the token from the object
     const token = authObject?.token;
    try {
      const deleteUrl = `http://20.204.102.191/LMS.API/LeaveRequest/${leaveId}`;
      const authToken = token;
      const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Other headers if needed
        },
      });
  
      if (!deleteResponse.ok) {
        throw new Error(`HTTP error! Status: ${deleteResponse.status}`);
      }
  
      console.log('Leave request deleted successfully');
      setSuccessMsg('LeaveRequest Cancelled sucessfully!')
      // Add any additional logic here, such as updating state or refreshing the screen
    } catch (error) {
      console.error('Error deleting leave request:', error.message);
    }
  };
  
  // Function to delete leave request by dateRequested from the local database
const deleteLeaveRequestFromDatabase = async (dateRequested) => {
  const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });

  db.transaction((tx) => {
    tx.executeSql(
      'DELETE FROM leave_request WHERE dateRequested = ?',
      [dateRequested],
      (_, deleteResult) => {
        if (deleteResult.rowsAffected > 0) {
          console.log('Leave request deleted from local database successfully');
          setSuccessMsg('Leave request deleted successfully')
          // Add any additional logic here, such as updating state or refreshing the screen
        } else {
          console.log('Leave request not found in local database');
          setErrorMsg('Leave request not found in local database')
        }
      },
      (_, deleteError) => {
        console.error('Error deleting leave request from local database:', deleteError);
      }
    );
  });
};

  



  return (
    <Block light container padding>
    <Block scroll>
      <Block row 
      justifyContent="space-between" 
      // style={{ backgroundColor: '#A1B4B0' }}
      alignItems="center" paddingVertical>
        <Button onPress={goToPreviousMonth}>
          <Text bold>{'<'}</Text>
        </Button>
        <Text black>{currentMonth.format('MMMM YYYY')}</Text>
        <Button onPress={goToNextMonth}>
          <Text bold>{'>'}</Text>
        </Button>
      </Block>

      {leaveRequests.map((request, index) => (
        <React.Fragment key={`fragment_${index}`}>
          <Block key={`block_${index}`} >
            <Block row paddingVertical>
            <TouchableOpacity onPress={() => handleBlockClick(request)}>
            <Text
            gray>{`${'\u2B24'} ${' '} ${dayjs(request.startDate).format('DD-MM-YYYY')}`}</Text>
            </TouchableOpacity>
            
            </Block>
            <Block
              key={`inner_block_${index}`}
              white
              radius
              row
              justifyContent="space-between"
              alignItems="center"
              marginVertical
              padding
            >
              <Block>
                <View>
                  <Text bold p marginVertical>
                    {dayjs(request.startDate).format('ddd, DD MMM')}
                  </Text>
                </View>

                <Text color={'#7E21CE'}>{request.type}</Text>
              </Block>

              <Block alignItems="flex-end" justifyContent="center">
              <Button
              radius
              color={request.isApproved === "1" ? '#ABE098' : request.isApproved === "2" ? '#F6BDC0' : '#F0F0F0'}
              padding={sizes.xs}
              height="auto"
              marginVertical
            >
              <Text
                bold
                color={
                  request.isApproved === "1"
                    ? '#2EB62C'
                    : request.isApproved === "2"
                    ?  '#EB7248'
                    : '#47D3CC' // Use your preferred color for Pending
                }
              >
                {request.isApproved === "1"
                  ? 'Approved'
                  : request.isApproved === "2"
                  ? 'Declined'
                  : 'Pending'}
              </Text>
</Button>


      <Button
          radius
          onPress={() => cancelLeaveRequest(request.dateRequested)}
          color={'#F0F0F0'} 
          padding={sizes.xs}
          height="auto"
          marginVertical>
          <Text bold color={'red'}>Cancel</Text>
        </Button>

              </Block>
            </Block>
          </Block>
        </React.Fragment>
      ))}
      <View style={{ alignItems: 'center' }}>
  
      {successMsg && (
        <Text style={{color:'green'}}>{successMsg}</Text>
      )}
      {errorMsg && (
        <Text style={{color:'red'}}>{errorMsg}</Text>
      )}
</View>
    </Block>
    {selectedLeaveRequest && (
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        style={styles.modalContainer}
        onRequestClose={closeModal}
      >
        <Block style={styles.modalCenter}>
        <Block style={styles.closeButtonContainer}>
              <Button onPress={closeModal}>
                <Text style={styles.closeButtonText}>X</Text>
              </Button>
            </Block>
        <Block style={styles.modalContent}>
            {/* Display the full data of the selected leave request */}
            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
              <Row
                data={['Field', 'Value']}
                widthArr={[150, 200]}
                style={styles.tableHeader}
                textStyle={styles.tableHeaderText}
              />
              <Rows
                data={[
                  ['Start Date', selectedLeaveRequest.startDate],
                  ['End Date', selectedLeaveRequest.endDate],
                  ['Type', selectedLeaveRequest.type],
                  ['Date Requested', selectedLeaveRequest.dateRequested],
                  ['Leave Count', `${calculateDurationInDays(selectedLeaveRequest)} days`],
                ]}
                widthArr={[150, 200]}
                style={styles.tableRow}
                textStyle={styles.tableRowText}
              />
            </Table>
            
          </Block>
        </Block>
      </Modal>
    )}
    
    
    
  </Block>
  );
};

export default LeaveStatusScrn;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the transparency as needed
  },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  modalContent: {
    width: '95%', // Adjust the width as needed
    backgroundColor: 'white',
    
  },
  tableHeader: { height: 40, backgroundColor: '#f1f8ff' },
  tableHeaderText: { textAlign: 'left', fontWeight: '700',paddingLeft:10 },
  tableRow: { height: 40, backgroundColor: '#f9f9f9' },
  tableRowText: { textAlign: 'left' ,paddingLeft:10},
  table:{alignItems:'flex-end'},
  closeButtonContainer: { 
    alignSelf: 'flex-end', 
    marginTop: 10,
    paddingRight:15,
    fontWeight:'bold' },
  closeButtonText: { color: 'gray', fontSize: 18 }, 
})
