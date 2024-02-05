
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Axios} from '../config';
import {apiKeys} from '../endPoints';
import { AddDataToTable } from '../../db/addDataToTable';
import { deleteAllData, deletecheck } from '../../db/deleteTable';
import { getNavDataApi } from '../navdata/navData';
import { getleaveType } from '../leave/leaveType';
import { getleaveReq } from '../leave/leaveReq';
import { getleavesummary } from '../leave/leaveSum';


export const getRosterDetailsApi = async () => {

// getNavDataApi();
getleaveType();
getleaveReq();
getleavesummary();

  try {
     
    const empCode = await AsyncStorage.getItem('@userId');
    console.log(empCode, "empcode");
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // First date of the last month
    const firstDateOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const formattedFirstDateOfLastMonth = `${String(firstDateOfLastMonth.getMonth() + 1).padStart(2, '0')}/${String(
      firstDateOfLastMonth.getDate()
    ).padStart(2, '0')}/${currentYear}`;
    
    // Last date of the next month
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const lastDateOfNextMonth = new Date(nextYear, nextMonth, 0);
    const formattedLastDateOfNextMonth = `${String(lastDateOfNextMonth.getMonth() + 1).padStart(2, '0')}/${String(
      lastDateOfNextMonth.getDate()
    ).padStart(2, '0')}/${nextYear}`;
    
    // Last date of the previous year (same as the end date but with the last year)
    const lastDateOfPreviousYear = new Date(currentYear - 1, currentMonth, 0);
    const formattedLastDateOfPreviousYear = `${String(lastDateOfPreviousYear.getMonth() + 1).padStart(2, '0')}/${String(
      lastDateOfPreviousYear.getDate()
    ).padStart(2, '0')}/${currentYear - 1}`;
    
    const startDate = formattedFirstDateOfLastMonth;
    const endDate = formattedLastDateOfNextMonth;
    const modifiedDate = formattedLastDateOfPreviousYear;
    
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Modified Date:", modifiedDate);
    
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
   
    deleteAllData('roster_details',Data)
    AddDataToTable('roster_details',Data)
    console.log(response.data, 'response in getRosterDetailsApi ');
    return {data: Data, message: ''};
 
  } catch (error) {
    let err;
    if (error.response) {
      err = error.response?.data || 'Login Faild,Try Again';
      console.log('error from getRosterDetailsApi response');
    } else if (error.request) {
      err = error.request;
    } else {
      err = error;
    }
    console.log(err, 'error from LoginRequest');
    throw {error: false, data: '', message: err};
  }

 

    
};

