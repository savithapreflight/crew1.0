import SQLite from 'react-native-sqlite-storage';
import getDBConnection from './index'


export const deleteAllData = async() => {
    const db=await getDBConnection();
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM roster_details', [], (tx, results) => {
        console.log('Data deleted successfully');
      },
      (error) => {
        console.log('Error deleting data:', error);
      });
    });
  };
  
  export const deleteleaveReq = async() => {
    const db=await getDBConnection();
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM leave_request', [], (tx, results) => {
        console.log('Data deleted successfully in Leave Request');
      },
      (error) => {
        console.log('Error deleting data in leave_request:', error);
      });
    });
  };


  export const deletecheck = async() => {
    const db=await getDBConnection();
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM check_ins', [], (tx, results) => {
        console.log('Data deleted successfully in check_ins');
      },
      (error) => {
        console.log('Error deleting data in check_ins:', error);
      });
    });
  };

  export const deletesummary = async() => {
    const db=await getDBConnection();
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM dashboard', [], (tx, results) => {
        console.log('Data deleted successfully in leave_summarys');
      },
      (error) => {
        console.log('Error deleting data in leave_summarys:', error);
      });
    });
  };