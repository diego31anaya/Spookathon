import { View, Text, StyleSheet, Pressable, Animated, Dimensions, PanResponder, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';

import { supplementData } from '../../data/supplement_data'; 


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SupplementPage() {
  const { id, name, time: initialTime, pm: initialPm} = useLocalSearchParams();
  const router = useRouter();

  const [time, setTime] = useState(initialTime || '');
  const [pm, setPm] = useState(initialPm === true || initialPm === 'true');


  // Animation for bottom sheet position
  const translateY = useRef(new Animated.Value(0)).current;
  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);

  // Pan gesture for swipe-down-to-close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 && !closingRef.current) {
          closingRef.current = true;
          setIsClosing(true);
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            router.back();
            closingRef.current = false;
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleSave = () => {
    const index = supplementData.findIndex((item) => item.id === id);
    if (index !== -1) {
      supplementData[index].time = time;
      supplementData[index].pm = pm;
    }
   
    router.back();
  };

  
  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Tap outside to close */}
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handleLine} />
        <Text style={styles.title}>{name || id}</Text>

        <View style={styles.informationContainer}>
          <View style={styles.informationRow}>
            <Text style={styles.informationLabel}>Time:</Text>

            {/* Editable time input */}
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={(text) => {
                let clean = text.replace(/[^0-9:]/g, '');

                if (clean.length > 5) clean = clean.slice(0, 5);

                 if (/^\d:\d$/.test(clean)) {
                    clean = clean[0] + ':' + clean[2] + '0';
                    }
                    setTime(clean)
              }}
              placeholder="Enter time"
              keyboardType="numbers-and-punctuation"
              maxLength={8}
            />

            {/* Toggle AM/PM */}
            <Pressable onPress={() => setPm(!pm)} style={styles.toggleButton}>
              <Text style={styles.toggleText}>{pm ? 'PM' : 'AM'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.actionText}>Save</Text>
          </Pressable>

          <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.actionText}>Cancel</Text>
          </Pressable>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    
  },
  sheet: {
    backgroundColor: 'rgb(96,48,145)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: SCREEN_HEIGHT * 0.65, // smaller height since less content for now
  },
  handleLine: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgb(254,244,215)',
  },
  informationContainer: {
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20,
  },
  informationLabel: {
    color: 'rgb(254,244,215)',
    fontSize: 16,
  },
  informationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    alignItems: 'center'
  },
  input: {
    backgroundColor: '#333',
    color: 'rgb(254,244,215)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: 'rgb(254,244,215)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  toggleText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 24,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  saveButton: {
    backgroundColor: 'limegreen',
  },
  cancelButton: {
    backgroundColor: 'crimson',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
