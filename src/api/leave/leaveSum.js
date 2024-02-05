import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { Axios } from '../config';
import { AddDataToTable } from '../../db/addDataToTable';
import SQLite from 'react-native-sqlite-storage';

const databaseName = 'CrewportDatabase.db';
const tableName = 'dashboard';

const closeDatabase = (db) => {
  if (db) {
    db.close().then(status => {
      console.log(`Database ${databaseName} closed successfully`);
    }).catch(error => {
      console.error('Error closing database', error);
    });
  }
};


export const getleavesummary = async () => {
  let db;
  try {
    const response = await Axios.get(
      'http://20.204.102.191/LMS.API/LeaveRequestSlot'
    );

    // console.log('leave_summary', response);

    if (response && response.data) {
      const res = response.data;

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

      // Open a SQLite database
      db = SQLite.openDatabase(
        { name: databaseName, location: 'default' },
        () => console.log(`Database ${databaseName} opened`),
        error => console.error('Error opening database', error)
      );

      // Create leave_summarys table if not exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          empCode TEXT,
          type TEXT,
          noOfDays INTEGER,
          leaveDays INTEGER
        )
      `;

      db.transaction(tx => {
        tx.executeSql(createTableQuery, [], (_, results) => {
          // console.log(`${tableName} table created`);

          // Insert data into the leave_summarys table with a check for duplicates
          const insertDataQuery = `
            INSERT INTO ${tableName} (empCode, type, noOfDays, leaveDays) VALUES (?, ?, ?, ?)
          `;

          Data.forEach(item => {
            item.leave_summary.leaveData.forEach(leave => {
              // Check if the row with the same empCode, type, and noOfDays already exists
              tx.executeSql(
                `SELECT * FROM ${tableName} WHERE empCode = ? AND type = ? AND noOfDays = ?`,
                [item.leave_summary.empCode, leave.type.trim(), leave.noOfDays],
                (_, result) => {
                  if (result.rows.length === 0) {
                    // If no matching row, insert the data
                    tx.executeSql(
                      insertDataQuery,
                      [item.leave_summary.empCode, leave.type.trim(), leave.noOfDays, leave.leaveDays],
                      (_, insertResult) => {
                        console.log('Data inserted into leave_summarys table');
                      }
                    );
                  } else {
                    console.log('Duplicate data detected. Skipping insertion.');
                  }
                }
              );
            });
          });

          // Select and log all data from the table after insertion
          const selectAllDataQuery = `SELECT * FROM ${tableName}`;
          tx.executeSql(selectAllDataQuery, [], (_, selectResult) => {
            // console.log('All data in leave_summarys table after insertion:', selectResult.rows.raw());
          });
        });
      });

      // console.log('Data added to the leave_summarys table successfully.');

      return { data: Data, message: 'Data added successfully.' };
    } else {
      console.log('No data in response from leave summary API.');
      return { data: [], message: 'No data available' };
    }
  } catch (error) {
    console.error('Error from leave type:', error);
    return { data: [], message: 'Error fetching or adding data to leave_summarys' };
  } finally {
    // Close the database connection
    if (db) {
      closeDatabase(db);
    }
  }
};
