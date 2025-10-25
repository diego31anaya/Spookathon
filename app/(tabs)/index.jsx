import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

const App = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View/>
  }

  if (!permission.granted) {
    return (
      <View>
        
      </View>
    )
  }


  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing={facing}/>
    </View>
  )
}

export default App