import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { Axios } from '../config';
import { AddDataToTable } from '../../db/addDataToTable';
import SQLite from 'react-native-sqlite-storage';
import { deletesummary } from '../../db/deleteTable';

const databaseName = 'CrewportDatabase.db';
const tableName = 'leave_summarys';

export const getleavesummary = async () => {
  let db;
  try {
    const response = await Axios.get(
      'http://20.204.102.191/LMS.API/LeaveRequestSlot'
    );

    if (response && response.data) {
      const res = response.data;

      // Process the response data and create the 'Data' array
      const Data = res.map((item) => ({
        leave_summary: {
          empCode: item.empCode || '',
          leaveData: item.leaveData.map((leave) => ({
            type: leave.type || '',
            noOfDays: leave.noOfDays || '',
            leaveDays: leave.leaveDays || '',
          })),
        },
      }));
      // deletesummary();
      await AddDataToTable(tableName, Data);
      console.log(tableName,"leave summary")
      console.log('Response in leave summary:', response.data);
      // console.log('Processed Data:', Data);

      return { data: Data, message: '' };
    } else {
      console.log('No data in response from leave summary API.');
      return { data: [], message: 'No data available' };
    }
  } catch (error) {
    console.log('Error from leave summary:', error);
    return { data: [], message: 'Error fetching data' };
  }
};
