import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native'
import React from 'react'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { scannedItems } from '../../data/data';
import { useRouter } from 'expo-router';

import BG from '../../assets/images/healthByteBackground.png';

  const Item = ({ title, image, onPress }) => (
    <Pressable style={styles.item} onPress={onPress}>
    {image ? (
      <Image source={{ uri: image }} style={styles.image} />
    ) : (
      <View style={styles.placeholderImage}>
        <Text style={{ color: '#888' }}>No Image</Text>
      </View>
    )}
    <Text style={styles.title}
    numberOfLines={1}
    adjustsFontSizeToFit
    minimumFontScale={0.7}
    ellipsizeMode='tail'
    >
      {title}
      </Text>
  </Pressable>

  );

const History = () => {
  const router = useRouter();

  const handlePress = (item) => {
    router.push({
      pathname: `/product/${item.barcode}`,
      params: {
        name: item.name,
        image: item.image,
        nutriGrade: item.nutriGrade,
        protein: item.protein,
        calories: item.calories,
        sugar: item.sugar,
        carbs: item.carbs,
        badIngredients: JSON.stringify(item.badIngredients || []),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed background image (doesn't move when list scrolls) */}
      <Image source={BG} style={styles.bgImage} resizeMode="cover" />

      <SafeAreaView style={styles.container}>
        <Text style={[{fontSize: 24}, {marginHorizontal: 16,}, {fontWeight: 'bold'}, {borderBottomWidth: 1}, {color: 'rgb(255,255,255)'}, {borderBottomColor: 'white'}]}>History</Text>
          <FlatList 
              data={scannedItems}
              renderItem={({ item }) => <Item 
              title={item.name}
              image={item.image}
              onPress={() => handlePress(item)} 
              />}
              keyExtractor={(item, index) => item.barcode || index.toString()}
          /> 
      </SafeAreaView>
    </View>
  )
}

export default History

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
    item: {
        backgroundColor: 'black',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
      },
      image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
      },
      placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      },
      title: {
        fontSize: 20,
        color: 'rgb(254,244,215)',
        fontWeight: '600',
        flexShrink: 1,
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