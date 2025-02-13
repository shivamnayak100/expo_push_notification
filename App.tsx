import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import messaging from '@react-native-firebase/messaging'
import { useEffect, useState } from 'react';


export default function App() {
  const [token, setToken] = useState<string>("");
  const [initialNotification, setInitialNotification] = useState<string>("");
  const [openAppNotification, setOpenAppNotification] = useState<string>("");
  const [backgroundNotification, setBackgroundNotification] = useState<string>("");
  const requestUserPermission = async (): Promise<boolean> => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('################# : ', authStatus);
    return enabled; // Ensure function always returns a boolean
  };

  useEffect(() => {
    const fetchToken = async () => {
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        messaging()
          .getToken()
          .then((token) => {
            console.log('############# Token:-- ', token);
            setToken(token);
          });
      } else {
        console.log('########## Permission not granted');
      }

      // Check whether an initial notification is available 
      messaging().getInitialNotification().then(async (remoteMessage) =>{
        if(remoteMessage){
          console.log("Notification caused app to open from quit state: ", remoteMessage.notification);
          setInitialNotification(JSON.stringify(remoteMessage));
        }
      })

      // Assume a message-notification contains a "type" property in the data payload of the screen to open. 

      messaging().onNotificationOpenedApp(async(remoteMessage) =>{
        console.log("Notification cause app to open from background state: ", remoteMessage.notification);
        setOpenAppNotification(JSON.stringify(remoteMessage));
      })

      // Register background handler
      messaging().setBackgroundMessageHandler( async(remoteMessage) =>{
        console.log("Message handled in the background! ", remoteMessage.notification);
        setBackgroundNotification(JSON.stringify(remoteMessage));
      })
    };

    fetchToken();


  }, []);

  return (
    <View style={styles.container}>
      <Text>This is expo push notification tutorial. </Text>
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Token:</Text>
      <Text style={{ padding: 10, backgroundColor: '#f4f4f4', borderRadius: 5 }}>
        {token || "Fetching token..."}
      </Text>
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>initialNotification:</Text>
      <Text style={{ padding: 10, backgroundColor: '#f4f4f4', borderRadius: 5 }}>
        {initialNotification || "Fetching initialNotification..."}
      </Text>
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>openAppNotification:</Text>
      <Text style={{ padding: 10, backgroundColor: '#f4f4f4', borderRadius: 5 }}>
        {openAppNotification || "Fetching openAppNotification..."}
      </Text>
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>backgroundNotification:</Text>
      <Text style={{ padding: 10, backgroundColor: '#f4f4f4', borderRadius: 5 }}>
        {backgroundNotification || "Fetching backgroundNotification..."}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
