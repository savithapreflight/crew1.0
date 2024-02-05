import { useEffect, useState } from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {CustomeDrawer} from './drawerComp';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import BottomTabRoute from './bottomTabRoute';
import {Dimensions,BackHandler, Alert} from 'react-native';
import { PersonalDetailsScrn } from '../pages/profile';




const windowWidth = Dimensions.get('window').width;

const Drawer = createDrawerNavigator();


const DrawerRoute = () => {



  return (
    <Drawer.Navigator
      drawerContent={props => <CustomeDrawer {...props} />}
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
        drawerStyle: {
          width: windowWidth > 700 ? wp('50') : wp('80'),
        },
      }}>

     {/*  <Drawer.Screen  name="personal"
      component={PersonalDetailsScrn} 
      options={{ headerShown: true }} />*/}

     
     
       <Drawer.Screen name="bottomTabs" component={BottomTabRoute} />
      
    </Drawer.Navigator>
  );
};


export default DrawerRoute;


// import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Alert } from 'react-native';
// import { CustomeDrawer } from './drawerComp';
// import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import BottomTabRoute from './bottomTabRoute';
// import { Dimensions, BackHandler } from 'react-native';
// import { PersonalDetailsScrn } from '../pages/profile';
// import { getRosterDetailsApi } from '../api/roster/rosterDetailsApi';

// const windowWidth = Dimensions.get('window').width;

// const Drawer = createDrawerNavigator();

// const DrawerRoute = ({navigation}) => {
//   const showExitAlert = () => {
//     Alert.alert(
//       'Alert',
//       'Do you want to go to the BottomTab or the login screen?',
//       [
//         {
//           text: 'Cancel',
//           onPress: () => {
//             getRosterDetailsApi();
//             navigation.navigate('login')},
//         },
//         {
//           text: 'OK',
          
//           onPress: () => {
//             getRosterDetailsApi();
//             navigation.navigate('bottomTabs')},
//         },
//       ],
//       { cancelable: false }
//     );
//   };

//   return (
//     <Drawer.Navigator
//       drawerContent={props => <CustomeDrawer {...props} />}
//       screenOptions={{
//         drawerType: 'front',
//         headerShown: false,
//         drawerStyle: {
//           width: windowWidth > 700 ? wp('50') : wp('80'),
//         },
//       }}>
//       {/*  <Drawer.Screen  name="personal"
//         component={PersonalDetailsScrn} 
//         options={{ headerShown: true }} />*/}

//         <Drawer.Screen
//         name="bottomTabs"
        
//         component={BottomTabRoute}
        
//       />
//       <Drawer.Screen
//         name="bottomTabs"
        
//         component={BottomTabRoute}
//         listeners={({ navigation }) => ({
//           // Add a listener for the focus event
//           focus: () => {
//             // Show the exit alert when the screen is focused
//             showExitAlert(navigation);
//           },
//         })}
//       />
//     </Drawer.Navigator>
//   );
// };

// export default DrawerRoute;

