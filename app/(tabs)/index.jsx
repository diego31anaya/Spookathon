import { View, Text, Pressable, StyleSheet, Animated, useWindowDimensions } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { addScannedItem } from '../../data/data.js';

let isNavigating = false;

const App = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false)
  const scannedRef = useRef(false);
  const router = useRouter();
  const scanningLockRef = useRef(false);



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
    
    isNavigating = false;
    scanningLockRef.current = false;
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
  
  }

  const handleBarCodeScanned =  async ({type, data}) => {

    if (scanningLockRef.current || isNavigating) return;
  scanningLockRef.current = true;
  isNavigating = true;

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();
      
      if (result.status === 1) {
        const product = result.product;
        const nutriGrade = product.nutriscore_grade || null

        const ingredientsText = product.ingredients_text?.toLowerCase() || '';

        const knownBadIngredients = [
          { key: 'high fructose corn syrup', severity: 'Very Bad', color: '#ff4d4d' },
          { key: 'corn syrup', severity: 'Moderate', color: '#f9a825' },
          { key: 'artificial color', severity: 'Moderate', color: '#f9a825' },
          { key: 'artificial flavour', severity: 'Moderate', color: '#f9a825' },
          { key: 'artificial flavor', severity: 'Moderate', color: '#f9a825' },
          { key: 'sodium nitrate', severity: 'Very Bad', color: '#ff4d4d' },
          { key: 'monosodium glutamate', severity: 'Moderate', color: '#f9a825' },
          { key: 'msg', severity: 'Moderate', color: '#f9a825' },
          { key: 'partially hydrogenated', severity: 'Very Bad', color: '#ff4d4d' },
          { key: 'trans fat', severity: 'Very Bad', color: '#ff4d4d' },
          { key: 'aspartame', severity: 'Moderate', color: '#f9a825' },
          { key: 'sucralose', severity: 'Moderate', color: '#f9a825' },
          { key: 'acesulfame potassium', severity: 'Moderate', color: '#f9a825' },
        ];

        const foundBadIngredients = knownBadIngredients.filter((item) =>
          ingredientsText.includes(item.key)
          );

        addScannedItem({
          name: product.product_name,
          barcode: data,
          image: product.image_url,
          nutriGrade: product.nutriscore_grade,
          calories:  product.nutriments?.['energy-kcal'] ?? 'N/A',
          protein: product.nutriments?.proteins_serving ?? 'N/A',
          sugar: product.nutriments?.sugars_serving ?? 'N/A',
          carbs: product.nutriments?.carbohydrates_serving ?? 'N/A',
          badIngredients: foundBadIngredients,
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
            badIngredients: JSON.stringify(foundBadIngredients),
            },
        });

      } else {
        console.log('Product not found');
        
      }

    } catch (error) {
      console.error('Error fetching product info:', error)
      
    } finally {
      // 🧹 unlock scanning after delay (prevents double fire)
      setTimeout(() => {
        scanningLockRef.current = false;
        isNavigating = false;
      }, 1500);
    }
  }

  return (
    <View style={{ flex: 1 }}>

      <CameraView 
      style={{ flex: 1 }} 
      facing={facing} 
      enableTorch={flashOn}
      onBarcodeScanned={handleBarCodeScanned}

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