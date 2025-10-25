// app/expiration.js
import { StyleSheet, Text, View } from 'react-native';

export default function ExpirationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expiration Dates</Text>
      <Text style={styles.subtitle}>Track expiration dates for scanned items here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
