// WelcomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getRosterDetailsApi } from '../../api/roster/rosterDetailsApi';

const EmptyScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //  getRosterDetailsApi()
  //     .then(() => {
  //       setIsLoading(false);
  //       // Navigate to the initial screen once data is loaded
  //       navigation.navigate('initial');
  //     })
  //     .catch((error) => {
  //       console.error('Error loading data:', error);
  //       // Handle errors, e.g., show an error message
  //     });
  // }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>Welcome to My App!</Text>
      )}
    </View>
  );
};

export default EmptyScreen;
