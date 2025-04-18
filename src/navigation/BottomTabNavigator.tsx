import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, Text } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import WeatherScreen from '../screens/WeatherScreen';
import MarketplaceScreen from '../screens/MarketPlace';
import GovernmentInitiativesScreen from '../screens/GovernmentInitiativesScreen';

// Theme
import theme from '../theme/theme';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Weather') {
            iconName = focused ? 'cloud' : 'cloud-outline';
          } else if (route.name === 'Market') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Government') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName as any} size={size} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text
              style={[styles.tabBarLabel, { color, opacity: focused ? 1 : 0.8 }]}
            >
              {route.name}
            </Text>
          );
        },
        tabBarActiveTintColor: route.name === 'Market' ? theme.colors.secondary :
                               route.name === 'Government' ? theme.colors.tertiary :
                               theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Weather" component={WeatherScreen} />
      <Tab.Screen name="Market" component={MarketplaceScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Government" component={GovernmentInitiativesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    height: 70,
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    ...theme.shadows.lg,
  },
  tabBarItem: {
    height: 50,
    paddingTop: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 5 : 0,
  },
});

export default BottomTabNavigator;
