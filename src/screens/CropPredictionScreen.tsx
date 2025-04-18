import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useCropData } from '../hooks/useCropData';

const CropPredictionScreen: React.FC = () => {
  const { loading, error, getPrediction } = useCropData();
  const [formData, setFormData] = useState({
    n: '',
    p: '',
    k: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  });

  const handleSubmit = async () => {
    const params = {
      n: Number(formData.n),
      p: Number(formData.p),
      k: Number(formData.k),
      temperature: Number(formData.temperature),
      humidity: Number(formData.humidity),
      ph: Number(formData.ph),
      rainfall: Number(formData.rainfall),
    };

    const result = await getPrediction(params);
    if (result) {
      // Handle the prediction result
      console.log('Prediction:', result);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nitrogen (N)"
        value={formData.n}
        onChangeText={(text) => setFormData({ ...formData, n: text })}
        keyboardType="numeric"
      />
      {/* Add similar TextInput components for other parameters */}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Predicting...' : 'Get Prediction'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
});

export default CropPredictionScreen;