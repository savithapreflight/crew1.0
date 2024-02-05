import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase({ name: 'CrewportDatabase.db' });

const checkTableExistence = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='navdata_details'",
      [],
      (_, { rows }) => {
        if (rows.length > 0) {
          console.log('navdata_details table exists.');
        } else {
          console.log('navdata_details table does not exist.');
        }
      },
      (_, error) => {
        console.error('Error executing SQL:', error);
      }
    );
  });
};

checkTableExistence();
