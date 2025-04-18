import { Platform } from 'react-native';

// Use localhost for web, and the computer's IP address for mobile
const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000'; // 10.0.2.2 is the special IP for Android emulator to access host machine
  // If using a physical device or iOS simulator, use your computer's actual IP address
  // Example: 'http://192.168.1.100:8000'

// Log the API URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

export default API_BASE_URL;
