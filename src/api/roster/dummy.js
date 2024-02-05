import AsyncStorage from '@react-native-async-storage/async-storage';
import {Axios} from '../config';
import {apiKeys} from '../endPoints';
import { AddDataToTable } from '../../db/addDataToTable';
import { deleteAllData } from '../../db/deleteTable';
import { getNavDataApi } from '../navdata/navData';
import { getleaveType } from '../leave/leaveType';
import { getleaveReq } from '../leave/leaveReq';
import { getleavesummary } from '../leave/leaveSum';





export const getRosterDetailsApi = async () => {

// getNavDataApi();
getleaveType();
getleaveReq();
getleavesummary();
// const fetchRosterDetails = async () => {

  try {
     
    const empCode = await AsyncStorage.getItem('@userId');
    console.log(empCode,"empcode")

  

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();

    // Calculate the first date of the current month
    // const firstDateOfMonth = new Date(currentYear, currentMonth - 1, 1);
    // const formattedFirstDate = `${String(firstDateOfMonth.getDate()).padStart(2, '0')}/${String(
    //   currentMonth
    // ).padStart(2, '0')}/${currentYear}`;

    // console.log("First date of current month:", formattedFirstDate);

    // Calculate the last date of the last month
    const firstDateOfLastMonth = new Date(currentYear, currentMonth - 2, 1);
    const formattedFirstDateOfLastMonth = `${String(firstDateOfLastMonth.getMonth() + 1).padStart(2, '0')}/${String(
      firstDateOfLastMonth.getDate()
    ).padStart(2, '0')}/${currentYear}`;

    console.log("First date of last month:", formattedFirstDateOfLastMonth);

    // Calculate the first date of the next month
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

const lastDateOfNextMonth = new Date(nextYear, nextMonth, 0);

const formattedLastDateOfNextMonth = `${String(nextMonth).padStart(2, '0')}/${String(
  lastDateOfNextMonth.getDate()
).padStart(2, '0')}/${nextYear}`;

console.log("Last date of next month:", formattedLastDateOfNextMonth);

const previousYear = currentYear - 1;

const formattedLastDateOfPreviousYear = `${String(nextMonth).padStart(2, '0')}/${String(
  lastDateOfNextMonth.getDate()
).padStart(2, '0')}/${previousYear}`;

console.log("Last date of previous year:", formattedLastDateOfPreviousYear);



  
    const startDate = formattedFirstDateOfLastMonth;
    const endDate = formattedLastDateOfNextMonth;
    const modifiedDate = formattedLastDateOfPreviousYear;
    console.log("api details",
      `${apiKeys.rosterAppDetails}/${empCode}?StartDate=${startDate}&EndDate=${endDate}&ModifiedDate=${modifiedDate}`,
    );
   
    

    const response = await Axios.get(
      `${apiKeys.rosterAppDetails}/${empCode}?StartDate=${startDate}&EndDate=${endDate}&ModifiedDate=${modifiedDate}`,
     
    );
    // console.log(response,"responseeee")
    
    const res = response?.data;
   
    const Data = res?.map(item => ({
      
      crewCode: item?.crewCode || '',
      crewDesig: item?.crewDesig || '',
      flightDate: item?.flightDate || '',
      patternNo: item?.patternNo || '',
      flightNo: item?.flightNo || '',
      deptTime: item?.deptTime || '',
      arrTime: item?.arrTime || '',
      startFrom: item?.startFrom || '',
      endsAt: item?.endsAt || '',
      flightFrom: item?.flightFrom || '',
      flightTo: item?.flightTo || '',
      restPeriod: item?.restPeriod || '',
      aircraftType: item?.aircraftType || '',
      patternStTime: item?.patternStTime || '',
      patternEndTime: item?.patternEndTime || '',
      id: item?.id || 0,
      isVoilated: item?.isVoilated || '',
      voilationReason: item?.voilationReason || '',
      reptIn: item?.reptIn || 0,
      reptOut: item?.reptOut || 0,
      checkinTime: item?.checkinTime || '',
      repInTime:item?.repInTime || '',
      repOutTime:item?.repOutTime || '',
      repInLat:item?.repInLat || '',
    repInLog:item?.repInLog || '',
    repOutLat:item?.repOutLat || '',
    repOutLog:item?.repOutLat || '',
      createdDate: item?.createdDate || '',
      modifiedDate: item?.modifiedDate || '',
      
    }));
    // deleteAllData('roster_details',Data)
//     AddDataToTable('roster_details',Data)
//     console.log(response.data, 'response in getRosterDetailsApi ');
//     return {data: Data, message: ''};
 
//   } catch (error) {
//     let err;
//     if (error.response) {
//       err = error.response?.data || 'Login Faild,Try Again';
//       console.log('error from getRosterDetailsApi response');
//     } else if (error.request) {
//       err = error.request;
//     } else {
//       err = error;
//     }
//     console.log(err, 'error from LoginRequest');
//     throw {error: false, data: '', message: err};
//   }

 

    
// };

let existingData = await getDataFromDatabase('roster_details');

if (!existingData || existingData.length === 0) {
  // If existing data is empty or not available, call AddDataToTable
  AddDataToTable('roster_details', Data);
console.log('Existing data in the database:', existingData);
  console.log('Data added to database');
} else {
  // If existing data is available, check for duplicates
  const shouldAddToDatabase = newData.some(newItem => {
    return !existingData.some(existingItem => {
      return (
        newItem.flightDate === existingItem.flightDate &&
        newItem.flightNo === existingItem.flightNo
      );
    });
  });

  if (shouldAddToDatabase) {
    // If flight date or flight number is different, call AddDataToTable
    AddDataToTable('roster_details', Data);
    console.log('Data added to database');
  } else {
    console.log('Data already exists in the database. Skipping addition.');
  }
}

console.log(response.data, 'response in getRosterDetailsApi ');
return { data: newData, message: '' };
  } catch (error) {
    // ... (previous code)
  }
};

// Replace this function with your actual database retrieval logic
const getDataFromDatabase = async (tableName) => {
  // Implement this function to retrieve data from the specified table in your database
  // You may need to use your existing database functions for this
  // Example: const data = await getData(tableName);
  // Replace the following line with your actual database retrieval logic

  // Placeholder: Replace with your actual asynchronous database retrieval function
  const data = await fetchRosterDetailsFromDatabase(tableName);
  return data;
};

// Placeholder function to simulate asynchronous database retrieval
const fetchRosterDetailsFromDatabase = async (tableName) => {
  // Replace this with your actual database retrieval logic
  // For example, you might use AsyncStorage.getItem or any other method

  // Simulating asynchronous database retrieval
  return new Promise(resolve => {
    setTimeout(() => {
      // Replace this with your actual data retrieval logic
      const data = [];
      resolve(data);
    }, 100);
  });
};