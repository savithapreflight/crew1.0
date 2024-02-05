import {ScrollView, StyleSheet, View} from 'react-native';
import React, { useEffect } from 'react';

import {Text, Block} from '../../components';
import useDefaultTheme from '../../hooks/useDefaultTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useState } from 'react';
import SQLite from 'react-native-sqlite-storage';
import { getleavesummary } from '../../api/leave/leaveSum';
import { getleaveReq } from '../../api/leave/leaveReq';

const LeaveSummaryScrn = () => {
  // getleavesummary();
  const {sizes, colors} = useDefaultTheme();
  const [leaveSum,setLeaveSum] = useState('');
  const [noDays,setNoDays] = useState('');
  const [leaveData, setLeaveData] = useState([]);
  const [pending,setPending] = useState('');
  const [approved,setApproved] = useState('');
  const [declined,setDeclined] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });
  
    const fetchData = async () => {
      try {
        const empCode = await AsyncStorage.getItem('@userId');
        // console.log(empCode, 'empNames');
  
        db.transaction(tx => {
          tx.executeSql(
            'SELECT DISTINCT type, noOfDays, leaveDays FROM dashboard WHERE empCode = ?',
          [empCode],
            (_, result) => {
              // console.log('Query Result:', result);
              const len = result.rows.length;
              const leaveDataArray = [];
              const uniqueTypes = new Set(); // Use a Set to keep track of unique types
  
              for (let i = 0; i < len; i++) {
                const row = result.rows.item(i); 
                const { type, noOfDays, leaveDays } = row;
                if (!uniqueTypes.has(type)) {
                  uniqueTypes.add(type);
                  leaveDataArray.push({ type, noOfDays, leaveDays });
                }
              }
              setLeaveData(leaveDataArray);
            },
            (_, error) => {
              console.error('Error executing SQL query:', error);
            }
          );
        });
      } catch (error) {
        console.log('Error retrieving data from leave_summary:', error);
      }
    };
  
    fetchData();
  }, []);
  
  
  
  useEffect(() => {
    const fetchData1 = async () => {
      const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });

      try {
        const employeeName = await AsyncStorage.getItem('@empnames');
        db.transaction((tx) => {
          tx.executeSql(
            'SELECT ' +
              'startDate, ' +
              'isApproved ' +
              'FROM leave_request ' +
              'WHERE employeeName = ? ' +
              'GROUP BY startDate, isApproved',
            [employeeName],
            (_, result) => {
              const uniqueStartDates = new Set();
              const counts = {
                emptyCount: 0,
                approvedCount1: 0,
                declinedCount2: 0,
              };

              for (let i = 0; i < result.rows.length; i++) {
                const item = result.rows.item(i);

                // Check if the start date is already in the Set
                if (!uniqueStartDates.has(item.startDate)) {
                  uniqueStartDates.add(item.startDate);
                }

                // Increment counts based on the isApproved status
                if (item.isApproved === "") {
                  counts.emptyCount++;
                } else if (item.isApproved === "1") {
                  counts.approvedCount1++;
                } else if (item.isApproved === "2") {
                  counts.declinedCount2++;
                }
              }

              // console.log('Unique Start Dates:', Array.from(uniqueStartDates));
              // console.log('Counts:', counts);

              setPending(counts.emptyCount);
              setApproved(counts.approvedCount1);
              setDeclined(counts.declinedCount2);
            },
            (_, error) => {
              console.error('Error executing SQL query:', error);
            }
          );
        });
      } catch (error) {
        console.log('Error retrieving data from leave_summary:', error);
      }
    };

    fetchData1();
  }, []);
 
  
  // useEffect(() => {
  //   const fetchData1 = async () => {
  //     const db = SQLite.openDatabase({ name: 'CrewportDatabase.db' });

  //     try {
  //       const employeeName = await AsyncStorage.getItem('@empnames');
  //       db.transaction(tx => {
  //         tx.executeSql(
  //           'SELECT ' +
  //             'COUNT(CASE WHEN isApproved = "" THEN 1 END) AS emptyCount, ' +
  //             'COUNT(CASE WHEN isApproved = 1 THEN 1 END) AS approvedCount1, ' +
  //             'COUNT(CASE WHEN isApproved = 2 THEN 1 END) AS declinedCount2 ' +
  //             'FROM leave_request ' +
  //             'WHERE employeeName = ?',
  //           [employeeName],
  //           (_, result) => {
  //             const counts = result.rows.item(0);
  //             setPending(counts.emptyCount);
  //             setApproved(counts.approvedCount1);
  //             setDeclined(counts.declinedCount2);
  //           },
  //           (_, error) => {
  //             console.error('Error executing SQL query:', error);
  //           }
  //         );
  //       });
  //     } catch (error) {
  //       console.log('Error retrieving data from leave_summary:', error);
  //     }
  //   };

  //   fetchData1();
  // }, []);

  // if (loading) {
  //   return <Text>Loading...</Text>;
  // }
  
  return (
    <Block container light padding>
      <ScrollView>
        <Block container light padding>
          {leaveData.map((item, index) => (
            // Check if the current index is even
            index % 2 === 0 ? (
              // Render a new row for every even index
              <Block key={index} paddingVertical row>
                <LeaveItem item={item} />

                {/* Check if there's another item in the array */}
                {index + 1 < leaveData.length && (
                  <LeaveItem item={leaveData[index + 1]} />
                )}
              </Block>
            ) : null
          ))}
        </Block>
        {/*
        <Block
        white
        elevation={2}
        margin
        radius
        row
        justifyContent={'space-between'}>
        <Block marginHorizontal padding center flex>
          <Block radius={100} width={80} height={80} center>
            <Block
              radius={100}
              background={'#C5E8B7'}
              width={75}
              height={75}
              center>
              <Text h3 color={'#2EB62C'}>
                {approved}
              </Text>
            </Block>
          </Block>
          <Text></Text>
          <Text textAlign="center">
            
            <Text h6>Approved</Text>
          </Text>
        </Block>
        <Block marginHorizontal padding center flex>
          <Block radius={100} width={80} height={80} center>
            <Block
              radius={100}
              background={'#FFF192'}
              width={75}
              height={75}
              center>
              <Text color={'#CCAA00'} h3>
                {pending}
              </Text>
            </Block>
          </Block>
          <Text></Text>
          <Text textAlign="center">
            
            <Text h6>Pending</Text>
          </Text>
        </Block>
        <Block marginHorizontal padding center flex>
          <Block radius={100} width={80} height={80} center>
            <Block
              radius={100}
              background={'#F6BDC0'}
              width={75}
              height={75}
              center>
              <Text danger h3>
                {declined}
              </Text>
            </Block>
          </Block>
          <Text></Text>
          <Text textAlign="center">
            
            <Text h6>Declined</Text>
          </Text>
        </Block>
      </Block>
       */}
       <Block white elevation={2} margin radius row justifyContent={'space-between'}>
       <LeaveCountBlock color={'#C5E8B7'} count={approved} label={'Approved'} />
       <LeaveCountBlock color={'#FFF192'} count={pending} label={'Pending'} />
       <LeaveCountBlock color={'#F6BDC0'} count={declined} label={'Declined'} />
     </Block>
      </ScrollView>
    </Block>
  );
};

const LeaveCountBlock = ({ color, count, label }) => (
  <Block marginHorizontal padding center flex>
    <Block radius={100} width={80} height={80} center>
      <Block radius={100} background={color} width={75} height={75} center>
        <Text h3 color={color === '#FFF192' ? '#CCAA00' : color === '#C5E8B7' ? '#2EB62C' : 'red'}>
          {count}
        </Text>
      </Block>
    </Block>
    <Text></Text>
    <Text textAlign="center">
      <Text h6>{label}</Text>
    </Text>
  </Block>
);

// Extracted component for rendering a single leave item
const LeaveItem = ({ item }) => {
  const colorMap = {
    AL: '#CCD6A6',
    CL: '#F4EAD5',
    HL: '#CBEDD5',
    ML: '#E6E5A3',
    MML: '#F4EAD5',
    SL: '#BCCEF8',
    UPL: '#99E7DA',
  };
  
  const getColor = (type) => colorMap[type] || '#E7AF99';

  return (
    
    <Block
      elevation
      radius
      white
      flex
      background={getColor(item.type)} // Set background color dynamically
      marginHorizontal
      padding
    >
      <Text>
        <Text h5>{item.leaveDays}/{item.noOfDays}</Text>
      </Text>
      <Text>{item.type}</Text>
    </Block>

    
    
    
  );
};


export default LeaveSummaryScrn;

const styles = StyleSheet.create({});


