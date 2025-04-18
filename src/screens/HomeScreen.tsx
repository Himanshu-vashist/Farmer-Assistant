import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import FeatureCard from '../components/FeatureCard';
import VoiceSearchBar from '../components/VoiceSearchBar';
import { Feature } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import theme from '../theme/theme';

type RootStackParamList = {
  Home: undefined;
  SoilTest: undefined;
  CropRecommendation: undefined;
  PlantDetector: undefined;
  Chatbot: undefined;
  Weather: undefined;
  HowToUse: undefined;
  Marketplace: undefined;
  GovernmentInitiatives: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const numColumns = width > 768 ? 3 : 2;

// Weather data interface
interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

// Enhanced Feature interface
interface EnhancedFeature extends Feature {
  description: string;
  color: string;
}

const features: EnhancedFeature[] = [
  {
    id: '1',
    title: 'Soil Test',
    description: 'Analyze your soil composition',
    screen: 'SoilTest',
    icon: 'leaf-outline',
    color: theme.colors.success
  },
  {
    id: '2',
    title: 'Crop Recommendation',
    description: 'Get personalized crop suggestions',
    screen: 'CropRecommendation',
    icon: 'nutrition-outline',
    color: theme.colors.warning
  },
  {
    id: '3',
    title: 'Plant Detector',
    description: 'Identify plants and diseases',
    screen: 'PlantDetector',
    icon: 'scan-outline',
    color: theme.colors.info
  },
  {
    id: '4',
    title: 'AI Assistant',
    description: 'Get farming advice from AI',
    screen: 'Chatbot',
    icon: 'chatbubble-outline',
    color: theme.colors.primary
  },
  {
    id: '5',
    title: 'Weather Forecast',
    description: 'Check local weather conditions',
    screen: 'Weather',
    icon: 'cloud-outline',
    color: theme.colors.secondary
  },
  {
    id: '6',
    title: 'Crop Prediction',
    description: 'Predict crop yields and harvest times',
    screen: 'CropPrediction',
    icon: 'analytics-outline',
    color: theme.colors.tertiary
  },
  {
    id: '7',
    title: 'Marketplace',
    description: 'Buy and sell agricultural products',
    screen: 'Marketplace',
    icon: 'basket-outline',
    color: '#673AB7'
  },
  {
    id: '8',
    title: 'Government Initiatives',
    description: 'Access government schemes and policies',
    screen: 'GovernmentInitiatives',
    icon: 'document-text-outline',
    color: theme.colors.tertiary
  },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'Sunny',
    icon: 'sunny-outline',
  });
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('Farmer');

  // Tips for farmers
  const tips = [
    'Rotate your crops to prevent soil depletion',
    'Use companion planting to reduce pests naturally',
    'Conserve water with drip irrigation systems',
    'Test your soil regularly for optimal fertilization',
    'Monitor weather forecasts to plan farming activities',
  ];

  // Set greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Simulate fetching weather data
  useEffect(() => {
    // In a real app, you would fetch weather data from an API
    // This is just a simulation
    const fetchWeather = async () => {
      // Simulate API call
      setTimeout(() => {
        setWeather({
          temperature: Math.floor(Math.random() * 15) + 15, // Random temp between 15-30
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
          icon: ['sunny-outline', 'cloudy-outline', 'rainy-outline', 'partly-sunny-outline'][Math.floor(Math.random() * 4)],
        });
      }, 1000);
    };

    fetchWeather();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      // Update weather with new random data
      setWeather({
        temperature: Math.floor(Math.random() * 15) + 15,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        icon: ['sunny-outline', 'cloudy-outline', 'rainy-outline', 'partly-sunny-outline'][Math.floor(Math.random() * 4)],
      });
      setRefreshing(false);
    }, 1500);
  }, []);

  // Get random tip
  const getRandomTip = useCallback(() => {
    return tips[Math.floor(Math.random() * tips.length)];
  }, [tips]);

  // Render feature card
  const renderFeature = useCallback(
    ({ item, index }: { item: EnhancedFeature; index: number }) => {
      return (
        <Animated.View
          entering={FadeInRight.delay(400 + index * 100).duration(500)}
          style={styles.featureCardContainer}
        >
          <TouchableOpacity
            style={[styles.featureCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.screen as keyof RootStackParamList)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={24} color="#fff" />
            </View>
            <Text style={styles.featureTitle}>{item.title}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Weather */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>

          <TouchableOpacity
            style={styles.weatherCard}
            onPress={() => navigation.navigate('Weather')}
          >
            <Ionicons name={weather.icon as any} size={24} color={theme.colors.primary} />
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Daily Tip */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient
            colors={[theme.colors.info, theme.colors.infoLight]}
            style={styles.tipCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="bulb-outline" size={24} color="#fff" style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Tip of the Day</Text>
              <Text style={styles.tipText}>{getRandomTip()}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Features Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => renderFeature({ item: feature, index }))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Weather')}
            >
              <Ionicons name="cloud-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Weather</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Marketplace')}
            >
              <Ionicons name="basket-outline" size={24} color="#673AB7" />
              <Text style={styles.quickActionText}>Market</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Chatbot')}
            >
              <Ionicons name="chatbubble-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Assistant</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('GovernmentInitiatives')}
            >
              <Ionicons name="document-text-outline" size={24} color={theme.colors.tertiary} />
              <Text style={styles.quickActionText}>Govt.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.emptyStateText}>No recent activities</Text>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start an Activity</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...theme.shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.card,
    opacity: 0.9,
  },
  userName: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: '700',
    color: theme.colors.card,
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 12,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  temperature: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
  },
  weatherCondition: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.card,
    marginBottom: 4,
  },
  tipText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.card,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCardContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
    height: 150,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 10,
    alignItems: 'center',
    width: '18%',
    ...theme.shadows.sm,
  },
  quickActionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  startButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.card,
  },
  searchBar: {
    marginBottom: 20,
    width: '100%',
  },
});

export default HomeScreen;
