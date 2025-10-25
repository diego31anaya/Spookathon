import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';


import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const App = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false)
  const [scanned, setScanned] = useState(false); // ✅ added

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

  const handleBarCodeScanned =  async ({type, data}) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();
      
      if (result.status === 1) {
        const product = result.product;
        console.log('Product found:', product.product_name);
        console.log('Brand:', product.brands);
        console.log('Calories (100g):', product.nutriments['energy-kcal_100g']);
      } else {
        console.log('Product not found');
      }

    } catch (error) {
      console.error('Error fetching product info:', error)
    }

    setScanned(false);
  }

  return (
    <View style={{ flex: 1 }}>

      <CameraView 
      style={{ flex: 1 }} 
      facing={facing} 
      enableTorch={flashOn}
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: [
          'ean13',
          'ean8',
          'upc_a',
          'upc_e',
          'code128',
          'code93',
          'code39',
        ],
      }}
      />

      <Pressable style={[styles.flashButton, {backgroundColor: flashOn ? 'white' : 'rgba(0,0,0,0.5)'}]} onPress={toggleFlash}>
        <MaterialIcons name="flashlight-on" size={24} 
        color= {flashOn ? 'black' : 'white'} />
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
  }
})