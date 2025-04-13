// import React from 'react';
// import { useColorScheme } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
// import HomeScreen from '../screens/HomeScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import LoginScreen from '../screens/LoginScreen';
// import SignUpScreen from '../screens/SignUpScreen';
// import ProfileScreen from '../screens/ProfileScreen'; // Import ProfileScreen from screens folder
// import SoilTestScreen from '../screens/SoilTestScreen';
// import CropRecommendationScreen from '../screens/CropRecommendationScreen';
// import PlantDetectorScreen from '../screens/PlantDetectorScreen';
// import ChatbotScreen from '../screens/ChatbotScreen';
// import WeatherScreen from '../screens/WeatherScreen';
// // Define the type for the stack navigator's parameters
// export type RootStackParamList = {
//   Home: undefined;
  
//   GameDetails: {
//     SoilTest: undefined;
//   CropRecommendation: undefined;
//   PlantDetector: undefined;
//   Chatbot: undefined;
//   Weather: undefined;
//     description: string;
//     thumbnail: any; // Use 'any' for require() images
//   };
//   Settings: undefined;

//   Login: undefined;
//   SignUp: undefined;

//   Profile: { username: string; avatarUrl?: string }; // Profile screen params

//   Leaderboard: { isDarkMode: boolean };
// };



// const Stack = createStackNavigator<RootStackParamList>();

// const Navigation: React.FC = () => {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="SignUp" screenOptions={{ headerShown: false }}>
//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{ title: 'Home' } as StackNavigationOptions}
//         />
      
//         <Stack.Screen
//           name="Settings"
//           component={SettingsScreen}
//           options={{ title: 'Settings' } as StackNavigationOptions}
//         />
      
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={{ title: 'Login' } as StackNavigationOptions}
//         />
//         <Stack.Screen
//           name="SignUp"
//           component={SignUpScreen}
//           options={{ title: 'Sign Up' } as StackNavigationOptions}
//         />
    
       
//         <Stack.Screen
//           name="Profile"
//           component={ProfileScreen}
//           options={{
//             title: 'Profile',
//             // presentation: 'modal', // Show as modal overlay
//             // cardStyle: { backgroundColor: 'transparent' }, // Transparent background
//             // headerShown: false, // Hide header for overlay effect
//           } as StackNavigationOptions}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };
// export default Navigation;
// import React from 'react';
// import { useColorScheme } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';

// import HomeScreen from '../screens/HomeScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import LoginScreen from '../screens/LoginScreen';
// import SignUpScreen from '../screens/SignUpScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import SoilTestScreen from '../screens/SoilTestScreen';
// import CropRecommendationScreen from '../screens/CropRecommendationScreen';
// import PlantDetectorScreen from '../screens/PlantDetectorScreen';
// import ChatbotScreen from '../screens/ChatbotScreen';
// import WeatherScreen from '../screens/WeatherScreen';
// import CustomHeader from '../components/CustomHeader'; // Adjust path as needed


// // Define the type for the stack navigator's parameters
// export type RootStackParamList = {
//   Home: undefined;
//   Settings: undefined;
//   Login: undefined;
//   SignUp: undefined;
//   Profile: { username: string; avatarUrl?: string };
//   SoilTest: undefined;
//   CropRecommendation: undefined;
//   PlantDetector: undefined;
//   Chatbot: undefined;
//   Weather: undefined;
 
// };

// const Stack = createStackNavigator<RootStackParamList>();

// const Navigation: React.FC = () => {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="SignUp" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
//         <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
//         <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
//         <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Sign Up' }} />
//         <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
//         <Stack.Screen name="SoilTest" component={SoilTestScreen} options={{ title: 'Soil Test' }} />
//         <Stack.Screen
//           name="CropRecommendation"
//           component={CropRecommendationScreen}
//           options={{ title: 'Crop Recommendation' }}
//         />
//         <Stack.Screen
//           name="PlantDetector"
//           component={PlantDetectorScreen}
//           options={{ title: 'Plant Detector' }}
//         />
//         <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Chatbot' }} />
       
//         <Stack.Screen
//   name="Weather"
//   component={WeatherScreen}
//   options={{
//     header: () => <CustomHeader title="Weather" />,
//     headerShown: true,
//   }}
// />

//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default Navigation;
// src/navigation/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SoilTestScreen from '../screens/SoilTestScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';
import PlantDetectorScreen from '../screens/PlantDetectorScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import WeatherScreen from '../screens/WeatherScreen';

import CustomHeader from '../components/CustomHeader';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Login: undefined;
  SignUp: undefined;
  Profile: { username: string; avatarUrl?: string };
  SoilTest: undefined;
  CropRecommendation: undefined;
  PlantDetector: undefined;
  Chatbot: undefined;
  Weather: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        {/* Auth screens without headers */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />

        {/* App screens with custom headers */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ header: () => <CustomHeader title="Home" showBackButton={false} /> }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ header: () => <CustomHeader title="Settings" /> }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ header: () => <CustomHeader title="Profile" /> }}
        />
        <Stack.Screen
          name="SoilTest"
          component={SoilTestScreen}
          options={{ header: () => <CustomHeader title="Soil Test" /> }}
        />
        <Stack.Screen
          name="CropRecommendation"
          component={CropRecommendationScreen}
          options={{ header: () => <CustomHeader title="Crop Recommendation" /> }}
        />
        <Stack.Screen
          name="PlantDetector"
          component={PlantDetectorScreen}
          options={{ header: () => <CustomHeader title="Plant Detector" /> }}
        />
        <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{ header: () => <CustomHeader title="Chatbot" /> }}
        />
        <Stack.Screen
          name="Weather"
          component={WeatherScreen}
          options={{ header: () => <CustomHeader title="Weather" /> }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
