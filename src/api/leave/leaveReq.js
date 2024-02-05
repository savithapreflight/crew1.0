import AsyncStorage from '@react-native-async-storage/async-storage';
import { Axios } from '../config';
import { apiKeys } from '../endPoints';
import { AddDataToTable } from '../../db/addDataToTable';
import { deleteleaveReq } from '../../db/deleteTable';


export const getleaveReq = async () => {
  try {
    const response = await Axios.get(
      'http://20.204.102.191/LMS.API/LeaveRequest'
    );
    if (response && response.data) {
      const res = response.data;
      const Data = res.map((item) => ({
        ids:item.id || '',
        startDate: item.startDate || '',
        endDate:  item.endDate || '',
        id:'',
        type:  item.type || '',
        dateRequested:  item.dateRequested || '',
        requestComments:  item.requestComments || '',
        isApproved:  item.isApproved || '',
        adminComments: item.adminComments || '',
        employeeName:  item.employeeName || '',
       
      }));
      const tableName = 'leave_request';
      // deleteleaveReq(tableName,Data)
      await AddDataToTable(tableName, Data);
      console.log(tableName,"leave request")
      console.log('Response in leave requestss:', response.data);
      console.log('Processed Data:', Data);

      return { data: Data, message: '' };
    } else {
      console.log('No data in response from leave Request API.');
      return { data: [], message: 'No data available' };
    }
  } catch (error) {
    console.log('Error from leave Request:', error);
    return { data: [], message: 'Error fetching data' };
  }
};
