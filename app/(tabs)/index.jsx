import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const App = () => {
  const router = useRouter();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false)
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

  const toggleFlash = () => {
    setFlashOn(!flashOn);
    console.log(flashOn ? 'Flash Off' : 'Flash On');
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing={facing} enableTorch={flashOn}/>

      <Pressable style={[styles.flashButton, {backgroundColor: flashOn ? 'white' : 'rgba(0,0,0,0.5)'}]} onPress={toggleFlash}>
        <MaterialIcons name="flashlight-on" size={24} 
        color= {flashOn ? 'black' : 'white'} />
      </Pressable>
      <Pressable style={styles.navButton} onPress={() => router.push('/history')}>
  <Text style={styles.navText}>History</Text>
</Pressable>

      <Pressable style={styles.navButton} onPress={() => router.push('/expiration')}>
        <Text style={styles.navText}>Expiration</Text>
      </Pressable>

      <Pressable style={styles.navButton} onPress={() => router.push('/expiration')}>
        <Text style={styles.navText}>Expiration</Text>
      </Pressable>

    </View>
    
  )
}

export default App

const styles = StyleSheet.create({
  flashButton: {
    position: 'absolute',
    top: 50,         // adjust for status bar
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  navButton: {
  position: 'absolute',
  bottom: 40,
  left: 20,
  backgroundColor: '#000000aa',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginBottom: 10,
},
navText: {
  color: '#fff',
  fontSize: 16,
}
})