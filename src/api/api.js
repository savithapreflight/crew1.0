
import SQLite from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiUrl = 'http://20.204.102.191/LMS.API/LeaveRequest';
const CIUrl = 'http://20.204.102.191/CSTAR.API/CheckIn';
const RIUrl ='http://20.204.102.191/CSTAR.API/ReportingIn';
const ROUrl ='http://20.204.102.191/CSTAR.API/ReportingOut';


const db = SQLite.openDatabase({
  name: 'CrewportDatabase.db',
  location: 'default',
});

const uploadDataToApi = async (data) => {
    try {
         // Retrieve the authentication token from AsyncStorage
    const authData = await AsyncStorage.getItem('@auth');

    // Parse the JSON string into an object
    const authObject = JSON.parse(authData);

    // Extract the token from the object
    const token = authObject?.token;

    // Log the token only
    // console.log('Token:', token);
    // console.log('Data to upload:', data);
        // Include the token in the request headers
        const response = await axios.post(apiUrl, data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
      console.log('Data uploaded to API successfully', response.data);
      // You can handle response data or status here if needed
    } catch (error) {
      console.log('Error uploading data to API:', error);
    }
  };

const fetchLeaveRequestsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT startDate,endDate,id,type,dateRequested,requestComments,isApproved,adminComments,employeeName FROM leave_request',
        [],
        (tx, results) => {
          const leaveRequests = [];
          for (let i = 0; i < results.rows.length; i++) {
            leaveRequests.push(results.rows.item(i));
          }
          console.log('Leave Requests from Database:', leaveRequests);
          resolve(leaveRequests);
        },
        (error) => {
          reject(error);
        },
      );
    });
  });
};

const syncDataWithApi = async () => {
  try {
    // Fetch leave requests from the local database
    const leaveRequests = await fetchLeaveRequestsFromDatabase();

    // Upload each leave request to the API
    for (const leaveRequest of leaveRequests) {
      // Modify the leave request data if needed
      const dataToUpload = {
        
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        type: leaveRequest.id,  // Assuming leaveRequest.id is the correct field to use for type
        dateRequested: leaveRequest.dateRequested,
        requestComments: leaveRequest.requestComments,
        isApproved: "0",
        adminComments: leaveRequest.adminComments,
        employeeName: leaveRequest.employeeName,
      };

      console.log('Leave Request Data:', dataToUpload);

      // Upload data to the API
      await uploadDataToApi(dataToUpload);

      // TODO: Optionally, you can update the local database to mark the data as synced
    }

    console.log('Data sync with API successful');
  } catch (error) {
    console.log('Error syncing data with API:', error);
  }
};

const checkInternetAndSyncData = async () => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    // await syncDataWithApi();
    await fetchCheckin();
    await syncCI();
    await syncRI();
    await syncRO();
  
  }
};

const uploadCI = async (data) => {
  try {
    const authData = await AsyncStorage.getItem('@auth');
    const authObject = JSON.parse(authData);
    const token = authObject?.token;

    const responseCI = await axios.post(CIUrl, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Data uploaded to CIAPI successfully', responseCI.data);
    console.log('Upload to API successful.');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      console.log('Validation Errors:', error.response.data.errors);
    } else {
      console.log('Error uploading data to API:', error.message);
    }
  }
  
};


const syncCI = async () => {
  try {
    const checkins = await fetchCheckin();
    for (const checkin of checkins) {
      const dataToUploadCI = {
        CrewCode: checkin.crewCode,
        FlightDate: checkin.flightDate,
        PatternNumber: checkin.patternno,
        DepArpt: checkin.Dep,
        ArrArpt: checkin.Arrival,
        checkInTime: checkin.checkinTime,       
      };


      
      console.log('CI data:', dataToUploadCI);
      await uploadCI(dataToUploadCI);
  }

    console.log('Data CI sucess');
  } catch (error) {
    console.log('Error syncing data with API CI:', error);
    console.log('Error response data:', error.response.data);
  }
  
};

const uploadRI = async (data) => {
  try {
    const authData = await AsyncStorage.getItem('@auth');
    const authObject = JSON.parse(authData);
    const token = authObject?.token;

    const responseRI = await axios.post(RIUrl, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Data uploaded to RIApi successfully', responseRI.data);
    console.log('Upload to API successful.');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      console.log('Validation Errors:', error.response.data.errors);
    } else {
      console.log('Error uploading data to API:', error.message);
    }
  }
};


const syncRI = async () => {
  try {
    const reportins = await fetchCheckin();
    for (const reportin of reportins) {
      const dataToUploadRI = {
        CrewCode: reportin.crewCode,
        FlightDate: reportin.flightDate,
        PatternNumber: reportin.patternno,
        DepArpt: reportin.Dep,
        ArrArpt: reportin.Arrival,
        reportingInTime:reportin.repInTime,
        reportingInLat:reportin.repInLat,
        reportingInLon:reportin.repInLng
              
      };


      
      console.log('RI data:', dataToUploadRI);
      await uploadRI(dataToUploadRI);
  }

    console.log('Data RI sucess');
  } catch (error) {
    console.log('Error syncing data with API RI:', error);
    console.log('Error response data RI:', error.response.data);
  }
  
};


const uploadRO = async (data) => {
  try {
    const authData = await AsyncStorage.getItem('@auth');
    const authObject = JSON.parse(authData);
    const token = authObject?.token;

    const responseRO = await axios.post(ROUrl, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Data uploaded to ROApi successfully', responseRO.data);
    console.log('Upload to API successful.');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      console.log('Validation Errors:', error.response.data.errors);
    } else {
      console.log('Error uploading data to API:', error.message);
    }
  }
};




const syncRO = async () => {
  try {
    const reportouts = await fetchCheckin();
    for (const reportout of reportouts) {
      const dataToUploadRO = {
        CrewCode: reportout.crewCode,
        FlightDate: reportout.flightDate,
        PatternNumber: reportout.patternno,
        DepArpt: reportout.Dep,
        ArrArpt: reportout.Arrival,
        reportingOutTime:reportout.repOutTime,
        reportingOutLat:reportout.repOutLat,
        reportingOutLon:reportout.repOutLng             
      };
      console.log('RO data:', dataToUploadRO);
      await uploadRO(dataToUploadRO);
  }

    console.log('Data RO sucess');
  } catch (error) {
    console.log('Error syncing data with API RO:', error);
    console.log('Error response data RO:', error.response.data);
  }
  
};


const fetchCheckin = ()=>{
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT crewCode,flightDate,patternno,Dep,Arrival,checkinTime,repInLat,repInLng,repInTime,repOutLat,repOutLng,repOutTime FROM check_ins',
        [],
        (tx, results) => {
          const data = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i));
          }
          console.log('data from database:', data);
          resolve(data);
        },
        (error) => {
          reject(error);
        },
      );
    });
  });
}



export default checkInternetAndSyncData;

