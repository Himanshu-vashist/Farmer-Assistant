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
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';

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

interface CropSuggestionResponse {
  suggested_crops: string;
}

const Weather: React.FC = () => {
  // State with TypeScript types
  const [city, setCity] = useState<string>('');
  const [N, setN] = useState<string>('');
  const [P, setP] = useState<string>('');
  const [K, setK] = useState<string>('');
  const [pH, setPH] = useState<string>('');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [cropSuggestion, setCropSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCropForm, setShowCropForm] = useState<boolean>(false);

  // Fetch weather forecast
  const getForecast = async () => {
    if (!city.trim()) {
      setError('Please enter a valid city');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch forecast');
      }

      const data: ForecastResponse = await res.json();
      setForecast(data);
      setShowCropForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch crop suggestion
  const getCropSuggestion = async () => {
    if (!N || !P || !K || !pH) {
      setError('Please fill in all soil nutrient fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/crop-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          N: parseInt(N),
          P: parseInt(P),
          K: parseInt(K),
          pH: parseFloat(pH),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get crop suggestion');
      }

      const data: CropSuggestionResponse = await res.json();
      setCropSuggestion(data.suggested_crops);
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather & Crop Suggestion</Text>
        <Text style={styles.date}>{new Date().toLocaleString()}</Text>
      </View>

      {/* Search Section */}
      <View style={styles.card}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.button, loading || !city.trim() ? styles.buttonDisabled : {}]}
            onPress={getForecast}
            disabled={loading || !city.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Forecast</Text>
            )}
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {/* Weather Forecast Section */}
      {forecast && (
        <>
          {/* Current Weather */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{city.toUpperCase()}</Text>
            <Text style={styles.subtitle}>
              Today {currentWeather.date.split('-')[2] || 'N/A'}
            </Text>
            <View style={styles.tempContainer}>
              <Text style={styles.temp}>{currentWeather.temp}</Text>
              <Text style={styles.unit}>°C</Text>
            </View>
            <Text style={styles.description}>{currentWeather.description}</Text>
          </View>

          {/* Air Conditions */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Air Conditions</Text>
            <View style={styles.conditionsGrid}>
              <View style={styles.conditionItem}>
                <Text style={styles.label}>Real Feel</Text>
                <Text style={styles.value}>{currentWeather.temp}°C</Text>
              </View>
              <View style={styles.conditionItem}>
                <Text style={styles.label}>Humidity</Text>
                <Text style={styles.value}>{currentWeather.humidity}%</Text>
              </View>
              <View style={styles.conditionItem}>
                <Text style={styles.label}>Wind</Text>
                <Text style={styles.value}>N/A m/s</Text>
              </View>
              <View style={styles.conditionItem}>
                <Text style={styles.label}>Clouds</Text>
                <Text style={styles.value}>N/A %</Text>
              </View>
            </View>
          </View>

          {/* Weekly Forecast */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Weekly Forecast</Text>
            <View style={styles.forecastGrid}>
              {forecastDays.map((day, index) => (
                <View key={index} style={styles.forecastCard}>
                  <Text style={styles.forecastDay}>
                    {index === 0 ? 'Today' : day.date || 'N/A'}
                  </Text>
                  <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                  <Text style={styles.forecastDescription}>{day.description}</Text>
                  <Text style={styles.forecastDetails}>
                    Humidity: {day.humidity || 'N/A'}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* Crop Suggestion Form */}
      {showCropForm && (
        <View style={styles.card}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>Crop Suggestion</Text>
            <TouchableOpacity onPress={() => setShowCropForm(!showCropForm)}>
              <Text style={styles.toggleText}>
                {showCropForm ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          {showCropForm && (
            <>
              <Text style={styles.formSubtitle}>
                Enter soil nutrient values:
              </Text>
              <View style={styles.soilInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nitrogen (N)</Text>
                  <TextInput
                    style={styles.input}
                    value={N}
                    onChangeText={setN}
                    placeholder="e.g. 50"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phosphorus (P)</Text>
                  <TextInput
                    style={styles.input}
                    value={P}
                    onChangeText={setP}
                    placeholder="e.g. 30"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Potassium (K)</Text>
                  <TextInput
                    style={styles.input}
                    value={K}
                    onChangeText={setK}
                    placeholder="e.g. 20"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>pH Level</Text>
                  <TextInput
                    style={styles.input}
                    value={pH}
                    onChangeText={setPH}
                    placeholder="e.g. 6.5"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  loading || !N || !P || !K || !pH ? styles.buttonDisabled : {},
                ]}
                onPress={getCropSuggestion}
                disabled={loading || !N || !P || !K || !pH}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Get Crop Suggestions</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Crop Suggestion Result */}
      {cropSuggestion && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommended Crops</Text>
          <Text style={styles.suggestionText}>{cropSuggestion}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 24,
    color: '#666',
    marginLeft: 5,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  conditionItem: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  forecastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  forecastCard: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  forecastTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  forecastDescription: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  forecastDetails: {
    fontSize: 14,
    color: '#666',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleText: {
    fontSize: 16,
    color: '#007AFF',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  soilInputs: {
    gap: 10,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 5,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default Weather;
