import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FeatureCard from '../components/FeatureCard';
import VoiceSearchBar from '../components/VoiceSearchBar';
import { Feature } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  SoilTest: undefined;
  CropRecommendation: undefined;
  PlantDetector: undefined;
  Chatbot: undefined;
  Weather: undefined;
  HowToUse: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const numColumns = width > 768 ? 3 : 2;

const features: Feature[] = [
  { id: '1', title: 'AI Assistant', screen: 'Chatbot', icon: 'assistant' },
  { id: '2', title: 'Soil Test', screen: 'SoilTest', icon: 'science' },
  { id: '3', title: 'Crop Recommendation', screen: 'CropRecommendation', icon: 'grass' },
  { id: '4', title: 'Plant Detector', screen: 'PlantDetector', icon: 'local-florist' },
  { id: '5', title: 'Chatbot', screen: 'Chatbot', icon: 'chat' },
  { id: '6', title: 'Weather Forecast', screen: 'Weather', icon: 'cloud' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);

  const renderFeature = useCallback(
    ({ item, index }: { item: Feature; index: number }) => {
      console.log(`Rendering feature: ${item.title}`); // Debug log
      return (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
          <FeatureCard
            title={item.title}
            icon={item.icon}
            onPress={() => {
              console.log(`Navigating to ${item.screen}`); // Debug navigation
              navigation.navigate(item.screen as keyof RootStackParamList);
            }}
            style={styles.featureCard}
          />
        </Animated.View>
      );
    },
    [navigation]
  );

  return (
    <LinearGradient colors={['#4CAF50', '#81C784']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Animated.Text entering={FadeIn.duration(600)} style={styles.header}>
            Farmer Assistant
          </Animated.Text>
          <VoiceSearchBar style={styles.searchBar} />
          <FlatList
            data={features}
            renderItem={renderFeature}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.featureList}
            key={numColumns}
          />
          <View style={styles.howToUseContainer}>
            <TouchableOpacity
              style={styles.howToUseHeader}
              onPress={() => {
                console.log(`Toggling How to Use: ${!isHowToUseOpen}`); // Debug state
                setIsHowToUseOpen(!isHowToUseOpen);
              }}
            >
              <Text style={styles.howToUseTitle}>How to Use Farmer Assistant</Text>
              <Icon
                name={isHowToUseOpen ? 'expand-less' : 'expand-more'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            {isHowToUseOpen && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.howToUseContent}>
                <Text style={styles.howToUseText}>
                  1. **Explore Features**: Tap any card to access tools like Soil Test, Crop
                  Recommendation, or Weather Forecast.
                </Text>
                <Text style={styles.howToUseText}>
                  2. **Voice Search**: Use the voice search bar to ask questions or navigate
                  quickly.
                </Text>
                <Text style={styles.howToUseText}>
                  3. **Get Insights**: Each feature provides AI-powered insights to improve your
                  farming.
                </Text>
                <Text style={styles.howToUseText}>
                  4. **Stay Updated**: Check the Weather Forecast for real-time farming decisions.
                </Text>
              </Animated.View>
            )}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('HowToUse')}>
              <Text style={styles.footerLink}>Learn More</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>© 2025 Farmer Assistant</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, maxWidth: isWeb ? '100vw' : undefined },
  scrollContainer: { flexGrow: 1 },
  container: {
    flex: 1,
    padding: isWeb ? 40 : 20,
    alignItems: 'center',
    maxWidth: isWeb ? 1200 : undefined,
    alignSelf: isWeb ? 'center' : undefined,
  },
  header: {
    fontSize: isWeb && width > 1024 ? 42 : isWeb ? 36 : 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginVertical: isWeb ? 40 : 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchBar: { marginBottom: 20, width: '100%', maxWidth: 600 },
  featureList: { paddingBottom: 20, justifyContent: 'center' },
  featureCard: { margin: 10, width: width / numColumns - 20 },
  howToUseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '100%',
    maxWidth: 600,
  },
  howToUseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  howToUseTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  howToUseContent: { marginTop: 10 },
  howToUseText: { fontSize: 14, color: '#fff', marginVertical: 5, lineHeight: 20 },
  footer: { marginTop: 30, alignItems: 'center' },
  footerLink: {
    fontSize: 16,
    color: '#fff',
    textDecorationLine: isWeb ? 'underline' : 'none',
    marginBottom: 10,
  },
  footerText: { fontSize: 12, color: '#fff', opacity: 0.7 },
});

export default HomeScreen;
