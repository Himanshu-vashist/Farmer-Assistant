import React, { useState } from 'react';
import './Weather.css';

const Weather = () => {
    const [city, setCity] = useState('');
    const [N, setN] = useState('');
    const [P, setP] = useState('');
    const [K, setK] = useState('');
    const [pH, setPH] = useState('');
    const [forecast, setForecast] = useState(null);
    const [cropSuggestion, setCropSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCropForm, setShowCropForm] = useState(false);

    const getForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://127.0.0.1:8000/forecast", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city }),
            });

            if (!res.ok) {
                throw new Error('Failed to fetch forecast');
            }

            const data = await res.json();
            console.log("Raw forecast data:", data); // Add this line
            setForecast(data);
            setShowCropForm(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const getCropSuggestion = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://127.0.0.1:8000/crop-suggestion", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city,
                    N: parseInt(N),
                    P: parseInt(P),
                    K: parseInt(K),
                    pH: parseFloat(pH)
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to get crop suggestion');
            }

            const data = await res.json();
            setCropSuggestion(data.suggested_crops);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Parse the forecast string into usable data
    // Parse the forecast string into usable data
    const parseForecast = (forecastStr) => {
        if (!forecastStr) return [];

        try {
            return forecastStr.split('\n')
                .filter(day => day.trim() !== '') // Remove empty lines
                .map(day => {
                    // Handle cases where the format might be different
                    const parts = day.split(': ');
                    if (parts.length < 2) return null;

                    const date = parts[0];
                    const weatherParts = parts[1].split(', ');

                    // Ensure we have all expected weather components
                    if (weatherParts.length < 3) {
                        return {
                            date,
                            temp: 'N/A',
                            humidity: 'N/A',
                            description: weatherParts[0] || 'N/A'
                        };
                    }

                    return {
                        date,
                        temp: weatherParts[0].replace('°C', '').trim(),
                        humidity: weatherParts[1].replace('% humidity', '').trim(),
                        description: weatherParts[2].trim()
                    };
                })
                .filter(day => day !== null); // Remove any null entries
        } catch (error) {
            console.error("Error parsing forecast:", error);
            return [];
        }
    };

    const forecastDays = forecast ? parseForecast(forecast.forecast) : [];
    const currentWeather = forecastDays[0] || {};

    return (
        <div className="weather-container">
            <h1>THE WEATHER FORECASTING & CROP SUGGESTION</h1>
            <p>{new Date().toLocaleString()}</p>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <button onClick={getForecast} disabled={loading || !city}>
                    {loading ? 'Loading...' : 'Get Forecast'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {forecast && (
                <div className="weather-content">
                    <div className="current-weather">
                        <h2>{city.toUpperCase()}</h2>
                        <p>Today {currentWeather.date?.split('-')[2]}</p>
                        <div className="temp-display">
                            <span className="temp">{currentWeather.temp}</span>
                            <span className="unit">°C</span>
                        </div>
                        <p className="description">{currentWeather.description}</p>
                    </div>

                    <div className="air-conditions">
                        <h3>AIR CONDITIONS</h3>
                        <div className="conditions-grid">
                            <div className="condition-item">
                                <span className="label">Real Feel</span>
                                <span className="value">{currentWeather.temp}°C</span>
                            </div>
                            <div className="condition-item">
                                <span className="label">Humidity</span>
                                <span className="value">{currentWeather.humidity}%</span>
                            </div>
                            <div className="condition-item">
                                <span className="label">Wind</span>
                                <span className="value">N/A m/s</span>
                            </div>
                            <div className="condition-item">
                                <span className="label">Clouds</span>
                                <span className="value">N/A %</span>
                            </div>
                        </div>
                    </div>

                    <div className="weekly-forecast">
                        <h3>WEEKLY FORECAST</h3>
                        <div className="forecast-grid">
                            {forecastDays.map((day, index) => (
                                <div className="forecast-card" key={index}>
                                    <div className="day">{index === 0 ? 'Today' : day.date || 'N/A'}</div>
                                    <div className="temp">{day.temp || 'N/A'}°C</div>
                                    <div className="description">{day.description || 'Weather data not available'}</div>
                                    <div className="details">
                                        <span>Humidity: {day.humidity || 'N/A'}%</span>
                                        <span>Wind: N/A m/s</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showCropForm && (
                <div className="crop-suggestion-form">
                    <h3>CROP SUGGESTION</h3>
                    <p>Enter soil nutrient values to get crop suggestions:</p>

                    <div className="soil-inputs">
                        <div className="input-group">
                            <label>Nitrogen (N):</label>
                            <input
                                type="number"
                                value={N}
                                onChange={(e) => setN(e.target.value)}
                                placeholder="e.g. 50"
                            />
                        </div>
                        <div className="input-group">
                            <label>Phosphorus (P):</label>
                            <input
                                type="number"
                                value={P}
                                onChange={(e) => setP(e.target.value)}
                                placeholder="e.g. 30"
                            />
                        </div>
                        <div className="input-group">
                            <label>Potassium (K):</label>
                            <input
                                type="number"
                                value={K}
                                onChange={(e) => setK(e.target.value)}
                                placeholder="e.g. 20"
                            />
                        </div>
                        <div className="input-group">
                            <label>pH Level:</label>
                            <input
                                type="number"
                                step="0.1"
                                value={pH}
                                onChange={(e) => setPH(e.target.value)}
                                placeholder="e.g. 6.5"
                            />
                        </div>
                    </div>

                    <button
                        onClick={getCropSuggestion}
                        disabled={loading || !N || !P || !K || !pH}
                        className="suggest-button"
                    >
                        {loading ? 'Analyzing...' : 'Get Crop Suggestions'}
                    </button>
                </div>
            )}

            {cropSuggestion && (
                <div className="crop-suggestion-result">
                    <h3>RECOMMENDED CROPS</h3>
                    <div className="suggestion-text">{cropSuggestion}</div>
                </div>
            )}
        </div>
    );
};

export default Weather;