import { View, Text, Pressable, StyleSheet, Animated, useWindowDimensions } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { addScannedItem } from '../../data/data.js';

const App = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false)
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);
  const router = useRouter();

  // Bat animation state (animation rendered as a child of CameraView)
  const [showBat, setShowBat] = useState(false);
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const BAT_DURATION_MS = 8000; // visible for 5s
  const BAT_INTERVAL_MS = 3 * 60 * 1000; // repeat every 3 minutes (adjust as desired)
  const BAT_ASSET = require('../../assets/bat.gif'); // add a bat.gif at /assets/images/bat.gif

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useFocusEffect(() => {
    setScanned(false);
    scannedRef.current = false;
  })

  // Show bat on app open for 5s, then every few minutes
  useEffect(() => {
    let intervalId;
    const showOnce = () => {
      setShowBat(true);
      animX.setValue(-150);
      animY.setValue(height * 0.18);
      Animated.parallel([
        Animated.timing(animX, {
          toValue: width + 150,
          duration: BAT_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(animY, { toValue: height * 0.14, duration: BAT_DURATION_MS / 4, useNativeDriver: true }),
          Animated.timing(animY, { toValue: height * 0.22, duration: BAT_DURATION_MS / 4, useNativeDriver: true }),
          Animated.timing(animY, { toValue: height * 0.16, duration: BAT_DURATION_MS / 4, useNativeDriver: true }),
          Animated.timing(animY, { toValue: height * 0.18, duration: BAT_DURATION_MS / 4, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setShowBat(false);
      });
    };

    // show once on mount
    showOnce();
    // schedule repeats
    intervalId = setInterval(showOnce, BAT_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [animX, animY, width, height]);


  if (!permission) {
    return <View/>
  }

  if (!permission.granted) {
    return (
      <View/>
    )
  }

  const toggleFlash = () => {
    setFlashOn(!flashOn);
    console.log(flashOn ? 'Flash Off' : 'Flash On');
  }

  const handleBarCodeScanned =  async ({type, data}) => {

    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();
      
      if (result.status === 1) {
        const product = result.product;
        console.log('Product found:', product.product_name);
        
        const nutriGrade = product.nutriscore_grade || null
        
        addScannedItem({
          name: product.product_name,
          barcode: data,
          image: product.image_url,
          nutriGrade: product.nutriscore_grade,
          calories:  product.nutriments?.['energy-kcal'] ?? 'N/A',
          protein: product.nutriments?.proteins_serving ?? 'N/A',
          sugar: product.nutriments?.sugars_serving ?? 'N/A',
          carbs: product.nutriments?.carbohydrates_serving ?? 'N/A',
        });
        
        router.push({
          pathname: `/product/${data}`,
          params: {
             name: product.product_name, 
             image: product.image_front_url,
             nutriGrade: nutriGrade || 'unknown',
             protein: product.nutriments.proteins_serving,
            calories: product.nutriments['energy-kcal'],
            sugar: product.nutriments.sugars_serving,
            carbs: product.nutriments.carbohydrates_serving,
            },
        });

        // console.log('Brand:', product.brands);
        // console.log('Calories (100g):', product.nutriments['energy-kcal_100g']);

      } else {
        console.log('Product not found');
        scannedRef.current = false;
        setScanned(false);
      }

    } catch (error) {
      console.error('Error fetching product info:', error)
      scannedRef.current = false;
      setScanned(false);
    }
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

        { /* Bat overlay rendered inside CameraView so all visual changes occur in the camera surface */ }
        {showBat && (
          <Animated.Image
            source={BAT_ASSET}
            style={[
              styles.bat,
              {
                transform: [
                  { translateX: animX },
                  { translateY: animY },
                  { rotate: animX.interpolate({ inputRange: [-150, width + 150], outputRange: ['-15deg', '15deg'] }) },
                ],
              }
            ]}
            pointerEvents="none"
            resizeMode="contain"
          />
        )}

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
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  bat: {
    position: 'absolute',
    width: 260,
    height: 160,
    zIndex: 1000,
    top: 0,
    left: 0,
  },
})