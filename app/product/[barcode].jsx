import { View, Text, StyleSheet, Pressable, Animated, Dimensions, PanResponder, Image, } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from "expo-router";
import React, { useRef, useState, useMemo } from 'react';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProductPage() {
  const { barcode, name, image, nutriGrade, protein, calories, sugar, carbs, badIngredients } = useLocalSearchParams();

  const router = useRouter()

  const parsedBadIngredients = useMemo(() => {
    try {
      return badIngredients ? JSON.parse(badIngredients) : [];
    } catch {
      return [];
    }
  }, [badIngredients]);

  const badIngredientsList = parsedBadIngredients;

  

  const rating = useMemo(() => {
    switch (nutriGrade?.toLowerCase()) {
      case 'a':
      case 'b':
        return { label: 'Safe', color: '#2e7d32' }; // green
      case 'c':
      case 'd':
        return { label: 'Okay in moderation', color: '#f9a825' }; // yellow
      case 'e':
        return { label: 'Avoid if possible', color: '#d32f2f' }; // red
      default:
        return { label: 'Unknown', color: '#757575' }; // gray
    }
  }, [nutriGrade]);
  

   // Animation value for the sheet’s Y position
   const translateY = useRef(new Animated.Value(0)).current;
   const [isClosing, setIsClosing] = useState(false);
   const closingRef = useRef(false);

   const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 && !closingRef.current) {
          closingRef.current = true;
          // swipe down → close
          setIsClosing(true);
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {router.back(), closingRef.current = false});
        } else {
          // restore to position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;


  return (
    <View style={styles.container}>
      
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handleLine} />
        <Text style={styles.title}>{name || barcode}</Text>
        
        <View style={styles.headerRow}>
            <View style={[styles.ratingBox, { backgroundColor: rating.color + '22' }]}>
              <Text style={[styles.ratingText, { color: rating.color }]}>{rating.label}</Text>
            </View>

            {image ? (
              <Image source={{ uri: image }} style={styles.headerImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={{ color: '#888' }}>No Image</Text>
              </View>
            )}
        </View>

        <View style={styles.nutritionContainer}>
              <View style={styles.nutritionRow}>
                <Text style={[{color: 'rgb(254,244,215)'}, {fontWeight: 'bold'},]}>Nutrition Facts</Text>
              </View>
              <View style={styles.nutritionRow}>
               <Text style={styles.nutritionLabel}>Calories per serving: {calories ? `${calories} cal` : 'N/A'}</Text>
              </View>
              
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein per serving: {protein ? `${protein} grams` : 'N/A'}</Text>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Sugar per serving: {sugar ? `${sugar} grams` : 'N/A'}</Text>
              </View>

              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Carbs per serving: {carbs ? `${carbs} grams` : 'N/A'}</Text>
              </View>
              
        </View>

        <View style={styles.badIngredientsContainer}>
          <View style={styles.badIngredientsHeader}>
            <Text style={styles.badIngredientsTitle}>Bad Ingredients</Text>
          </View>

          {badIngredientsList.length > 0 ? (
            badIngredientsList.map((item, index) => (
              <View key={index} style={styles.ingredientRow}>
                {/* some entries may use "key" instead of "name" */}
                <Text style={styles.ingredientName}>{item.name || item.key}</Text>
                <Text style={[styles.ingredientSeverity, { color: item.color }]}>
                  {item.severity}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.ingredientNone}>No major red-flag ingredients detected.</Text>
          )}
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
    height: SCREEN_HEIGHT * 0.85, // changes how tall the popup sheet is
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },
  
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionContainer: {
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20
  },
  nutritionLabel: {
    color: 'rgb(254,244,215)',
    fontSize: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  badIngredientsContainer: {
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 20,
  },
  badIngredientsHeader: {
    borderBottomColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 8,
  },
  badIngredientsTitle: {
    color: 'rgb(254,244,215)',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  ingredientName: {
    color: 'rgb(254,244,215)',
    fontSize: 15,
  },
  ingredientSeverity: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  ingredientNone: {
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

