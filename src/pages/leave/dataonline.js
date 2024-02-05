import sendLeaveRequestToApi from "../../api/api";


export const sendDataWhenOnline = async (data, token) => {
    try {
      const response = await sendLeaveRequestToApi(data, token);
  
      if (response.status === 200) {
        console.log('Data added successfully');
        // or trigger an alert
        // Alert.alert('Data added successfully');
      } else {
        console.log('Failed to add data');
        // or trigger an alert
        // Alert.alert('Failed to add data');
      }
    } catch (error) {
      console.error('Error sending data to the API:', error);
      // or trigger an alert
      // Alert.alert('Error sending data to the API');
    }
  };