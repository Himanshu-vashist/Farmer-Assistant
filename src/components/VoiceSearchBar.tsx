import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

const VoiceSearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>('');

  const startListening = async () => {
    // Placeholder: Integrate Google Cloud Speech-to-Text or similar
    console.log('Listening...');
    // Simulate voice input
    setQuery('Sample voice query');
  };

  const resetQuery = () => setQuery('');

  const getResponse = () => {
    // Query Firebase or external API with 'query'
    console.log('Searching:', query);
    // Example: Save query to Firestore
    // db.collection('searches').add({ query, timestamp: new Date() });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search or speak..."
      />
      <View style={styles.buttonContainer}>
        <Button title="Speak" onPress={startListening} />
        <Button title="Reset" onPress={resetQuery} />
        <Button title="Search" onPress={getResponse} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default VoiceSearchBar;