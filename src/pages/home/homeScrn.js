import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, StatusBar, StyleSheet, Text, ToastAndroid, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import Page from './page';

import {_colors} from '../../css/colors';
import SettingScrn from '../settings/settingScrn';
import { getRosterDetailsApi } from '../../api/roster/rosterDetailsApi';
import { personalDetailsApi } from '../../api/user/userDetailsApi';






const HomeScrn = () => {
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('MST')
  const [showMst, setShowMst] = useState('');

  

  const handleModeChange = (newValue) => {
    // console.log('Mode changed:', newValue);
    setShowMst(newValue);
  };
  
 

  useEffect(() => {
    
 
    getRosterDetailsApi();
   
    setTimeout(() => {
      setLoading(false); 
    }, 2000);
    
  }, []);

  

  return (
    <>
      <StatusBar backgroundColor={_colors.primary} />    
      <Page loading={loading} selectedLocation={selectedLocation} onModeChange={handleModeChange} />
     
      
    </>
  );
};

export default HomeScrn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    // backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
