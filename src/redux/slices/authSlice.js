import {createSlice} from '@reduxjs/toolkit';
import {LoginRequest} from '../../api/user/authApi';
import ToastMsg from '../../components/toastMsg';
import { deleteAllData, deletecheck, deletesummary } from '../../db/deleteTable';
import { deleteAll } from '../../db/deleteAll';
import { clearPersonalDetails } from './profileSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { StackActions } from '@react-navigation/native';
import {personalDetailsApi} from '../../api/user/userDetailsApi';


const AuthSlice = createSlice({
  name: 'authentication',
  initialState: {
    loading: false,
    data: {},
    error: false,
    message: '',
  },
  reducers: {
    login: (state, {payload}) => {
      state.error = false;
      state.data = payload;
      state.loading = false;
      return state;
    },
    logOut: state => {
      state.error = false;
      state.data = {};
      state.loading = false;
      return state;
    },
    loading: (state, {payload}) => {
      state.loading = payload;
      return state;
    },
  },
});

export const {login, loading, logOut} = AuthSlice.actions;

// export const loginAction = (name, password) => {
 
//   return async Dispatch => {
//     Dispatch(loading(true));
//     try {
     
//       const response = await LoginRequest(name, password);
//       Dispatch(login(response.data));
//          console.log(response.data, 'response in loginAction');
         
       
//       return {error: false};
//     } catch (error) {
//       console.log(error, 'error in  loginAction');
//       Dispatch(loading(false));
//       // ToastMsg(error.message);
//       alert(error.message)
//       throw {error: true};
//     }
//   };
// };


export const loginAction = (name, password) => {
  
  return async (dispatch) => {
    dispatch(loading(true));
    try {
      const response = await LoginRequest(name, password);
      let userData = response.data;
     

      // Check if the "empcode" is available in the user data
      if (!userData.empCode) {
        // If not, call the personalDetailsApi to fetch the "empcode"
        const personalDetailsResponse = await personalDetailsApi(userData.userName);
        userData = {
          ...userData,
          empCode: personalDetailsResponse.data.empCode,
          // empDesign:personalDetailsResponse.data.empDesign
        };
        
      }

      if (!userData.empDesig) {
        // If not, call the personalDetailsApi to fetch the "empcode"
        const personalDetailsResponse = await personalDetailsApi(userData.userName);
        userData = {
          ...userData,
          // empCode: personalDetailsResponse.data.empCode,
          empDesign:personalDetailsResponse.data.empDesig
        };
        // console.log(userData,"user Data")
      }

      if (!userData.empName) {
        // If not, call the personalDetailsApi to fetch the "empcode"
        const personalDetailsResponse = await personalDetailsApi(userData.userName);
        userData = {
          ...userData,
          // empCode: personalDetailsResponse.data.empCode,
          empNames:personalDetailsResponse.data.empName
        };
        // console.log(userData,"user Data")
      }

      if (!userData.gender) {
        // If not, call the personalDetailsApi to fetch the "empcode"
        const personalDetailsResponse = await personalDetailsApi(userData.userName);
        userData = {
          ...userData,
          // empCode: personalDetailsResponse.data.empCode,
          gender:personalDetailsResponse.data.gender
        };
        // console.log(userData,"user Data gender")
      }
      

      // Set the "empcode" immediately upon successful login
      await AsyncStorage.setItem('@userId', userData.empCode);
      await AsyncStorage.setItem('@empdesigns', userData.empDesign);
      await AsyncStorage.setItem('@empnames', userData.empNames);
      await AsyncStorage.setItem('@genders',userData.gender);

      dispatch(login(userData));
      console.log(userData, 'response in loginAction');
      return { error: false };
    } catch (error) {
      console.log(error, 'error in loginAction');
      dispatch(loading(false));
      // ToastMsg(error.message)
      
      // alert(error.message);
      // throw { error: true };
      throw { error: true, message: error.message };
    }
  };
};

export const loginError = (message) => {
  return (dispatch) => {
    dispatch({
      type: 'authentication/loginError',
      payload: { message },
    });
  };
};



export const logOutAction = () => {
  return async (dispatch) => {
     deleteAll();
     deletecheck();
     deletesummary();
     await AsyncStorage.clear();
    dispatch(logOut());
    navigation.navigate('login');
  };
};




export default AuthSlice.reducer;
