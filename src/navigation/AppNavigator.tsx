import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


// Screens
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SoilTestScreen from '../screens/SoilTestScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';
import PlantDetectorScreen from '../screens/PlantDetectorScreen';
import CropPredictionScreen from '../screens/CropPredictionScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import MarketplaceScreen from '../screens/MarketPlace';
import GovernmentInitiativesScreen from '../screens/GovernmentInitiativesScreen';
// Navigation
import BottomTabNavigator from './BottomTabNavigator';

// Components
import CustomHeader from '../components/CustomHeader';
import TraderScreen from '../screens/TraderScreen';
import FarmerScreen from '../screens/FarmerScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  Login: undefined;
  SignUp: undefined;
  SoilTest: undefined;
  CropRecommendation: undefined;
  PlantDetector: undefined;
  CropPrediction: undefined;
  Chatbot: undefined;
  Marketplace: undefined;
  TraderScreen: undefined;
  FarmerScreen: undefined;
  GovernmentInitiatives: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Auth screens without headers */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />

        {/* Main app with bottom tabs */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{ headerShown: true }}
        />
            <Stack.Screen
          name="TraderScreen"
          component={TraderScreen}
          options={{ headerShown: true }}
        />
             <Stack.Screen
          name="FarmerScreen"
          component={FarmerScreen}
          options={{ headerShown: true }}
        />
        {/* Other screens with custom headers */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ header: () => <CustomHeader title="Settings" /> }}
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
          name="CropPrediction"
          component={CropPredictionScreen}
          options={{ header: () => <CustomHeader title="Crop Prediction" /> }}
        />
        <Stack.Screen
          name="Marketplace"
          component={MarketplaceScreen}
          options={{ header: () => <CustomHeader title="Marketplace" /> }}
        />
        <Stack.Screen
          name="GovernmentInitiatives"
          component={GovernmentInitiativesScreen}
          options={{ header: () => <CustomHeader title="Government Initiatives" /> }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
