import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SoilTestScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Soil Test</Text>
    <Text>Enter soil parameters or upload an image.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
});

export default SoilTestScreen;