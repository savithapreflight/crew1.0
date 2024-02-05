import AsyncStorage from '@react-native-async-storage/async-storage';
import { Axios } from '../config';
import { apiKeys } from '../endPoints';
import { AddDataToTable } from '../../db/addDataToTable';
import { deleteAllData } from '../../db/deleteTable';
import { deleteNav } from '../../db/deletenav';
import { deleteAll } from '../../db/deleteAll';


export const getleaveType = async () => {
  try {
    // Make an HTTP GET request
    const response = await Axios.get(
      'http://20.204.102.191/LMS.API/LeaveType'
    );

    // Check if the response contains data
    if (response && response.data) {
      const res = response.data;

      // Process the response data and create the 'Data' array
      const Data = res.map((item) => ({
        id:item.id||'',
        type:  item.type || '',
    description: item.description || '',
    noOfDays: item.noOfDays || '',
    maxSlot: item.maxSlot || '',
    gender: item.gender || '',
    startValidityDays: item.startValidityDays || '',
    carryForwardDays: item.carryForwardDays || '',
    designation: item.designation || '',
        
      }));

      // Call the 'AddDataToTable' function with the table name and data
      const tableName = 'leave_types';
      deleteAll(tableName,Data)
      // deleteAllData(tableName,Data)
      await AddDataToTable(tableName, Data);
      // console.log(tableName,"leave type")
      // console.log('Response in leave type:', response.data);
      
      // You can access 'Data' here or return it if needed
      // console.log('Processed Data leave_type:', Data);

      // Optionally, you can delete data from the table using 'deleteNav' function here.
      // deleteNav();
      // console.log('Deleted navdata');

      return { data: Data, message: '' };
    } else {
      console.log('No data in response from leave Types API.');
      return { data: [], message: 'No data available' };
    }
  } catch (error) {
    console.log('Error from leaves type:', error);

    // Handle the error gracefully
    return { data: [], message: 'Error fetching data leave_type' };
  }
};

