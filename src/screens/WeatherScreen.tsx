import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';

interface WeatherData {
  main: { temp: number };
  weather: { description: string }[];
}

const WeatherScreen: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    axios
      .get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: 'Delhi', // Replace with dynamic location
          appid: 'YOUR_OPENWEATHERMAP_API_KEY',
          units: 'metric',
        },
      })
      .then((response) => setWeather(response.data))
      .catch((error) => console.error(error));
  }, []);

  if (!weather) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Forecast</Text>
      <Text>Temperature: {weather.main.temp}°C</Text>
      <Text>Condition: {weather.weather[0].description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
});

export default WeatherScreen;