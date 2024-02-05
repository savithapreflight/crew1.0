import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import Geolocation from 'react-native-geolocation-service';

import {Block, PageHeader, Text} from '../../components';
import useDefaultTheme from '../../hooks/useDefaultTheme';
import {getCurrentPosition} from '../../services/location/getLocation';
import dayjs from 'dayjs';
import {useNavigation} from '@react-navigation/native';


const away = {
  latitude: 12.317082769348149,
  longitude: 76.69692965125222,
};
const equal = {
  latitude:13.040280,
  longitude: 77.650090,
};

const CheckInScrn = () => {
  const navigation = useNavigation();
  const {sizes, colors} = useDefaultTheme();

  const [currentCoords, setcurrentCoords] = useState();
  const [currentText, setCurrentText] = useState('');
  const [currentText1, setCurrentText1] = useState('');



//   const calculateDistance =async () => {
// // console.log("calculate distance");
//     const lat1 = (Math.PI * coordsIs.latitude) / 180;
//     const lon1 = (Math.PI * coordsIs.longitude) / 180;
//     const lat2 = (Math.PI * currentCoords.latitude) / 180;
//     const lon2 = (Math.PI * currentCoords.longitude) / 180;
  
//     const distance =
//       2 *
//       Math.asin(
//         Math.sqrt(
//           Math.sin((lat1 - lat2) / 2) ** 2 +
//             Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon1 - lon2) / 2) ** 2
//         )
//       );
//     console.log(distance, '----distance---');
 
    
//     if (distance > 1) {
//       Alert.alert('You are away from the premises', '', [
//         {
//           text: 'OK',
//           // onPress: () => navigation.navigate('bottomTabs', {screen: 'Home'}),
//         },
//       ]);
//       setinToTheRange(false);
//       setloading(false);
//       return;
//     }

//     setinToTheRange(true);
//     setloading(false);
//   };
useEffect(() => {
  (async () => {
    const res = await getCurrentPosition();
    setcurrentCoords({ latitude: res.latitude, longitude: res.longitude });

    const currentTime = dayjs().format('DD/MM/YYYY   HH:mm');
    
    const text = `Lat: ${res.latitude}\nLng: ${res.longitude}\nTime: ${currentTime}`;
    setCurrentText(text);
  })();
}, []);


      
  

  useEffect(() => {
   
        const fun=async()=>{
          await  calculateDistance();
        }
        fun()
    },
 [ currentCoords]);

 

  return (
    <Block light flex padding>
      <PageHeader borderRadius center>
        <Text h5>Report In</Text>
      </PageHeader>
      <Block center white marginVertical={sizes.s} radius elevation>
      
      <Block>
      <Text style={styles.text}>{currentText}</Text>
       
       
        </Block>
      </Block>
   
    </Block>
  );
};

export default CheckInScrn;

const styles = StyleSheet.create({
  text:{
    fontSize:17,
   
    flex:0.7,
    textAlign:'center'
   
  }
});


