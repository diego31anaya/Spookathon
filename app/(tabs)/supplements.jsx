import { View, Text, FlatList, Pressable, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useCallback } from 'react'

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { supplementData } from '../../data/supplement_data';
import { useRouter, useFocusEffect } from 'expo-router'

import MaterialIcons from '@expo/vector-icons/MaterialIcons' 

import BG from '../../assets/images/healthByteBackground.png';

const Supplements = () => {
  const router = useRouter();
  const [data, setData] = useState([...supplementData]);

  const [newName, setNewName] = useState('Add supplement');
  const [newTime, setNewTime] = useState('');
  const [newPm, setNewPm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Re-sync local data with the global array
      setData([...supplementData]);
    }, [])
  );

  const handlePress = (item) => {
    router.push({
      pathname: `/supplement/${item.id}`,
      params: {
        name: item.name,
        time: item.time,
        pm: item.pm
      },
    });
  };

  

  //delete function
  const handleDelete = (id) => {
    const index = supplementData.findIndex((item) => item.id === id);
    if (index !== -1) {
      supplementData.splice(index, 1); // remove from global array
      setData([...supplementData]);    // refresh local list
    }
  };

  const handleAdd = () => {
    if (newName.trim() === '' || newName.trim().toLowerCase() === 'add supplement') return;
    
    const newId = (Math.random() * 100000).toFixed(0);
    const newSupplement = {
      id: newId,
      name: newName.trim(),
      time: newTime || '00:00',
      pm: newPm,
    };

    supplementData.push(newSupplement);
    setData([...supplementData]);
    setNewName('Add supplement');
    setNewTime('');
    setNewPm(false);
  };

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
       // pushes addContainer above keyboard
    >
      <View style={{ flex: 1 }}>
      {/* Fixed background image (doesn't move when list scrolls) */}
      <Image source={BG} style={styles.bgImage} resizeMode="cover" />

        <SafeAreaView style={styles.container}>
            <Text style={[{fontSize: 24}, {marginHorizontal: 16,}, {fontWeight: 'bold'}, {borderBottomWidth: 1}, {color: 'rgb(255,255,255)'}, {borderBottomColor: 'white'}]}>Supplements</Text>

            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  
                    <Pressable onPress={() => handlePress(item)}>
                      <Text style={styles.title}>{item.name}: {item.time} {item.pm? 'pm' : 'am'}</Text>
                    </Pressable>

                <Pressable onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </Pressable>

                </View>
              )}
            />

          <View style={styles.addContainer}>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              onFocus={() => {
                if (newName === 'Add supplement') setNewName('');
              }}
              onBlur={() => {
                if (newName.trim() === '') setNewName('Add supplement');
              }}
            />

            <TextInput
              style={styles.timeInput}
              value={newTime}
              onChangeText={(text) => {
                let clean = text.replace(/[^0-9:]/g, '');
                if (clean.length > 5) clean = clean.slice(0, 5);
                if (/^\d:\d$/.test(clean)) clean = clean[0] + ':' + clean[2] + '0';
                setNewTime(clean);
              }}
              placeholder="00:00"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Pressable onPress={() => setNewPm(!newPm)} style={styles.toggleButton}>
              <Text style={styles.toggleText}>{newPm ? 'PM' : 'AM'}</Text>
            </Pressable>

            <Pressable onPress={handleAdd} style={styles.addButton}>
              <Text style={styles.addText}>+</Text>
            </Pressable>
          </View>

        </SafeAreaView>
      </View>
      </KeyboardAvoidingView>
    
  )
}

export default Supplements

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },  
  title: {
    fontSize: 20,
    color: 'rgb(254,244,215)',
    fontWeight: '600',
    flexShrink: 1,
    },
   
    itemRow: {
      backgroundColor: 'black',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    textContainer: { flex: 1, marginRight: 10 },
    
    addContainer: {
      position: 'absolute',
      bottom: 20,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'black',
      padding: 12,
      borderRadius: 12,
      justifyContent: 'space-between',
    },
  nameInput: {
    backgroundColor: '#333',
    color: 'rgb(254,244,215)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 120,
    fontSize: 16,
  },
  timeInput: {
    backgroundColor: '#333',
    color: 'rgb(254,244,215)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 70,
    textAlign: 'center',
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: 'rgb(254,244,215)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 6,
  },
  toggleText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: 'limegreen',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: undefined,
    height: undefined,
  },
});