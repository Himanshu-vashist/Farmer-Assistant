// import React, { useState } from 'react';


// const Weather = () => {
//     const [city, setCity] = useState('');
//     const [N, setN] = useState('');
//     const [P, setP] = useState('');
//     const [K, setK] = useState('');
//     const [pH, setPH] = useState('');
//     const [forecast, setForecast] = useState(null);
//     const [cropSuggestion, setCropSuggestion] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [showCropForm, setShowCropForm] = useState(false);

//     const getForecast = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await fetch("http://127.0.0.1:8000/forecast", {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ city }),
//             });

//             if (!res.ok) {
//                 throw new Error('Failed to fetch forecast');
//             }

//             const data = await res.json();
//             console.log("Raw forecast data:", data); // Add this line
//             setForecast(data);
//             setShowCropForm(true);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
//     const getCropSuggestion = async () => {
//         if (!N || !P || !K || !pH) {
//             setError('Please fill in all soil nutrient fields');
//             return;
//         }
//         setLoading(true);
//         setError(null);
//         try {
//             const res = await fetch("http://127.0.0.1:8000/crop-suggestion", {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     city,
//                     N: parseInt(N),
//                     P: parseInt(P),
//                     K: parseInt(K),
//                     pH: parseFloat(pH)
//                 }),
//             });

//             if (!res.ok) {
//                 throw new Error('Failed to get crop suggestion');
//             }

//             const data = await res.json();
//             setCropSuggestion(data.suggested_crops);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Parse the forecast string into usable data
//     // Parse the forecast string into usable data
//     const parseForecast = (forecastStr) => {
//         if (!forecastStr) return [];

//         try {
//             return forecastStr.split('\n')
//                 .filter(day => day.trim() !== '') // Remove empty lines
//                 .map(day => {
//                     // Handle cases where the format might be different
//                     const parts = day.split(': ');
//                     if (parts.length < 2) return null;

//                     const date = parts[0];
//                     const weatherParts = parts[1].split(', ');

//                     // Ensure we have all expected weather components
//                     if (weatherParts.length < 3) {
//                         return {
//                             date,
//                             temp: 'N/A',
//                             humidity: 'N/A',
//                             description: weatherParts[0] || 'N/A'
//                         };
//                     }

//                     return {
//                         date,
//                         temp: weatherParts[0].replace('°C', '').trim(),
//                         humidity: weatherParts[1].replace('% humidity', '').trim(),
//                         description: weatherParts[2].trim()
//                     };
//                 })
//                 .filter(day => day !== null); // Remove any null entries
//         } catch (error) {
//             console.error("Error parsing forecast:", error);
//             return [];
//         }
//     };

//     const forecastDays = forecast ? parseForecast(forecast.forecast) : [];
//     const currentWeather = forecastDays[0] || {};

//     return (
//         <div className="weather-container">
//             <h1>THE WEATHER FORECASTING & CROP SUGGESTION</h1>
//             <p>{new Date().toLocaleString()}</p>

//             <div className="search-container">
//                 <input
//                     type="text"
//                     placeholder="Enter city"
//                     value={city}
//                     onChange={(e) => setCity(e.target.value)}
//                 />
//                 <button onClick={getForecast} disabled={loading || !city}>
//                     {loading ? 'Loading...' : 'Get Forecast'}
//                 </button>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             {forecast && (
//                 <div className="weather-content">
//                     <div className="current-weather">
//                         <h2>{city.toUpperCase()}</h2>
//                         <p>Today {currentWeather.date?.split('-')[2]}</p>
//                         <div className="temp-display">
//                             <span className="temp">{currentWeather.temp}</span>
//                             <span className="unit">°C</span>
//                         </div>
//                         <p className="description">{currentWeather.description}</p>
//                     </div>

//                     <div className="air-conditions">
//                         <h3>AIR CONDITIONS</h3>
//                         <div className="conditions-grid">
//                             <div className="condition-item">
//                                 <span className="label">Real Feel</span>
//                                 <span className="value">{currentWeather.temp}°C</span>
//                             </div>
//                             <div className="condition-item">
//                                 <span className="label">Humidity</span>
//                                 <span className="value">{currentWeather.humidity}%</span>
//                             </div>
//                             <div className="condition-item">
//                                 <span className="label">Wind</span>
//                                 <span className="value">N/A m/s</span>
//                             </div>
//                             <div className="condition-item">
//                                 <span className="label">Clouds</span>
//                                 <span className="value">N/A %</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="weekly-forecast">
//                         <h3>WEEKLY FORECAST</h3>
//                         <div className="forecast-grid">
//                             {forecastDays.map((day, index) => (
//                                 <div className="forecast-card" key={index}>
//                                     <div className="day">{index === 0 ? 'Today' : day.date || 'N/A'}</div>
//                                     <div className="temp">{day.temp || 'N/A'}°C</div>
//                                     <div className="description">{day.description || 'Weather data not available'}</div>
//                                     <div className="details">
//                                         <span>Humidity: {day.humidity || 'N/A'}%</span>
//                                         <span>Wind: N/A m/s</span>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showCropForm && (
//                 <div className="crop-suggestion-form">
//                     <h3>CROP SUGGESTION</h3>
//                     <p>Enter soil nutrient values to get crop suggestions:</p>

//                     <div className="soil-inputs">
//                         <div className="input-group">
//                             <label>Nitrogen (N):</label>
//                             <input
//                                 type="number"
//                                 value={N}
//                                 onChange={(e) => setN(e.target.value)}
//                                 placeholder="e.g. 50"
//                             />
//                         </div>
//                         <div className="input-group">
//                             <label>Phosphorus (P):</label>
//                             <input
//                                 type="number"
//                                 value={P}
//                                 onChange={(e) => setP(e.target.value)}
//                                 placeholder="e.g. 30"
//                             />
//                         </div>
//                         <div className="input-group">
//                             <label>Potassium (K):</label>
//                             <input
//                                 type="number"
//                                 value={K}
//                                 onChange={(e) => setK(e.target.value)}
//                                 placeholder="e.g. 20"
//                             />
//                         </div>
//                         <div className="input-group">
//                             <label>pH Level:</label>
//                             <input
//                                 type="number"
//                                 step="0.1"
//                                 value={pH}
//                                 onChange={(e) => setPH(e.target.value)}
//                                 placeholder="e.g. 6.5"
//                             />
//                         </div>
//                     </div>

//                     <button
//                         onClick={getCropSuggestion}
//                         disabled={loading || !N || !P || !K || !pH}
//                         className="suggest-button"
//                     >
//                         {loading ? 'Analyzing...' : 'Get Crop Suggestions'}
//                     </button>
//                 </div>
//             )}

//             {cropSuggestion && (
//                 <div className="crop-suggestion-result">
//                     <h3>RECOMMENDED CROPS</h3>
//                     <div className="suggestion-text">{cropSuggestion}</div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Weather;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import API_BASE_URL from '../config/api';
import theme from '../theme/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

// TypeScript Interfaces
interface ForecastDay {
  date: string;
  temp: string;
  humidity: string;
  description: string;
}

interface ForecastResponse {
  forecast: string;
}



const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('rain')) return 'rainy';
  if (desc.includes('cloud')) return 'cloudy';
  if (desc.includes('clear')) return 'sunny';
  if (desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('snow')) return 'snow';
  return 'partly-sunny';
};

const Weather: React.FC = () => {
  // State with TypeScript types
  const [city, setCity] = useState<string>('');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather forecast
  const getForecast = async () => {
    if (!city.trim()) {
      setError('Please enter a valid city');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch forecast');
      }

      const data: ForecastResponse = await res.json();
      setForecast(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Parse forecast string into usable data
  const parseForecast = (forecastStr: string): ForecastDay[] => {
    if (!forecastStr) return [];

    try {
      return forecastStr
        .split('\n')
        .filter((day) => day.trim() !== '')
        .map((day) => {
          const parts = day.split(': ');
          if (parts.length < 2) return null;

          const date = parts[0];
          const weatherParts = parts[1].split(', ');

          if (weatherParts.length < 3) {
            return {
              date,
              temp: 'N/A',
              humidity: 'N/A',
              description: weatherParts[0] || 'N/A',
            };
          }

          return {
            date,
            temp: weatherParts[0].replace('°C', '').trim(),
            humidity: weatherParts[1].replace('% humidity', '').trim(),
            description: weatherParts[2].trim(),
          };
        })
        .filter((day): day is ForecastDay => day !== null);
    } catch (error) {
      console.error('Error parsing forecast:', error);
      return [];
    }
  };

  const forecastDays = forecast ? parseForecast(forecast.forecast) : [];
  const currentWeather = forecastDays[0] || {
    date: '',
    temp: 'N/A',
    humidity: 'N/A',
    description: 'N/A',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <Text style={styles.title}>Weather Forecast</Text>
          <Text style={styles.date}>{new Date().toLocaleString()}</Text>
        </Animated.View>
      </LinearGradient>

      {/* Search Section */}
      <Animated.View entering={FadeInDown.delay(200).duration(800)}>
        <Card style={styles.searchCard}>
          <Input
            label="Location"
            placeholder="Enter city name"
            value={city}
            onChangeText={setCity}
            icon="location-outline"
            containerStyle={styles.inputContainer}
          />
          <Button
            title="Get Weather Forecast"
            onPress={getForecast}
            loading={loading}
            disabled={loading || !city.trim()}
            icon="cloud-outline"
            style={styles.searchButton}
          />
          {error && <Text style={styles.error}>{error}</Text>}
        </Card>
      </Animated.View>

      {/* Weather Forecast Section */}
      {forecast && (
        <>
          {/* Current Weather */}
          <Animated.View entering={FadeInDown.delay(300).duration(800)}>
            <Card style={styles.weatherCard}>
              <View style={styles.currentWeatherHeader}>
                <View>
                  <Text style={styles.cityName}>{city.toUpperCase()}</Text>
                  <Text style={styles.weatherDate}>
                    Today {currentWeather.date.split('-')[2] || 'N/A'}
                  </Text>
                </View>
                <Ionicons
                  name={getWeatherIcon(currentWeather.description)}
                  size={48}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.tempContainer}>
                <Text style={styles.temp}>{currentWeather.temp}</Text>
                <Text style={styles.unit}>°C</Text>
              </View>
              <Text style={styles.description}>{currentWeather.description}</Text>

              <View style={styles.conditionsGrid}>
                <View style={styles.conditionItem}>
                  <Ionicons name="thermometer-outline" size={24} color={theme.colors.textSecondary} />
                  <View style={styles.conditionTextContainer}>
                    <Text style={styles.conditionLabel}>Real Feel</Text>
                    <Text style={styles.conditionValue}>{currentWeather.temp}°C</Text>
                  </View>
                </View>
                <View style={styles.conditionItem}>
                  <Ionicons name="water-outline" size={24} color={theme.colors.textSecondary} />
                  <View style={styles.conditionTextContainer}>
                    <Text style={styles.conditionLabel}>Humidity</Text>
                    <Text style={styles.conditionValue}>{currentWeather.humidity}%</Text>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Weekly Forecast */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <Card title="5-Day Forecast" style={styles.forecastCard}>
              {forecastDays.map((day, index) => (
                <View key={index} style={styles.forecastDay}>
                  <Text style={styles.forecastDayText}>
                    {index === 0 ? 'Today' : day.date.split('-')[2] || 'N/A'}
                  </Text>
                  <Ionicons
                    name={getWeatherIcon(day.description)}
                    size={28}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                  <Text style={styles.forecastHumidity}>{day.humidity}%</Text>
                </View>
              ))}
            </Card>
          </Animated.View>
        </>
      )}



      <View style={styles.footer}>
        <Text style={styles.footerText}>Farmer Assistant © 2025</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: '700',
    color: theme.colors.card,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  date: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.card,
    opacity: 0.8,
  },
  searchCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  searchButton: {
    marginTop: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  weatherCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cityName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  weatherDate: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: theme.spacing.md,
  },
  temp: {
    fontSize: theme.typography.fontSizes['5xl'],
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 56,
  },
  unit: {
    fontSize: theme.typography.fontSizes.xl,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: theme.spacing.md,
  },
  conditionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionTextContainer: {
    marginLeft: theme.spacing.sm,
  },
  conditionLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  conditionValue: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  forecastCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  forecastDay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  forecastDayText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
    width: 60,
  },
  forecastTemp: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    width: 60,
    textAlign: 'center',
  },
  forecastHumidity: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    width: 50,
    textAlign: 'right',
  },

  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default Weather;
