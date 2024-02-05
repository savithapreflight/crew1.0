import { StatusBar, StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect } from 'react';
import Routes from './src/router/routes';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { DataStore, PersistDataStore } from './src/redux';
import { getMultipleStoragePermission } from './src/services/permissions/storagePermission';
import getDBConnection from './src/db';
import { getRosterDetailsApi } from './src/api/roster/rosterDetailsApi';
import { personalDetailsApi } from './src/api/user/userDetailsApi';
import { AppProvider } from './src/appContext';
import PushNotification from 'react-native-push-notification';
// import { getNavDataApi } from './src/api/navdata/navData';
import { initializeDatabaseStructure } from './src/db/initializeDatabaseStructure';
// import NetInfo from '@react-native-community/netinfo';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import moment from 'moment';
// import axios from 'axios';
// import ApiTestComponent from './src/api/api';
// import UploadDataScreen, { sendDummyDataToApi } from './src/api/api';
import checkInternetAndSyncData from './src/api/api';



const App = () => {

  useEffect(() => {
    
    const syncDataInterval = setInterval(async () => {
      await checkInternetAndSyncData();
    }, 5 * 60 * 1000); 

    // Initial sync when the app starts
    checkInternetAndSyncData();

    // Clear the interval on component unmount
    return () => clearInterval(syncDataInterval);
  }, []);

 

  useEffect(() => {
    (async () => {
      
      await getMultipleStoragePermission();
      initializeDatabaseStructure();
      await getDBConnection();
      await getRosterDetailsApi();

      // Request notification permissions here (using async/await)
      const permissions = await PushNotification.requestPermissions();

      if (permissions.alert) {
        console.log('Notification permissions granted.');
        alert('framt');
      } else {
        console.warn('Notification permissions denied.');
        alert('denied');
      }
    })();
  }, []);


  return (
    <AppProvider>
      <Provider store={DataStore}>
        <PersistGate loading={null} persistor={PersistDataStore}>
          <View style={styles.container}>
            <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
            <Routes />
          </View>
        </PersistGate>
      </Provider>
    </AppProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
