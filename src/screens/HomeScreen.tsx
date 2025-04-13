import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const features: Feature[] = [
  { id: '1', title: 'AI Assistant', screen: 'Chatbot' },
  { id: '2', title: 'Soil Test', screen: 'SoilTest' },
  { id: '3', title: 'Crop Recommendation', screen: 'CropRecommendation' },
  { id: '4', title: 'Plant Detector', screen: 'PlantDetector' },
  { id: '5', title: 'Chatbot', screen: 'Chatbot' },
  { id: '6', title: 'Weather Forecast', screen: 'Weather' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const renderFeature = ({ item }: { item: Feature }) => (
    <FeatureCard
      title={item.title}
      onPress={() => navigation.navigate(item.screen as keyof RootStackParamList)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Farmer Assistant</Text>
      <VoiceSearchBar />
      <FlatList
        data={features}
        renderItem={renderFeature}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.featureList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  featureList: { paddingBottom: 20 },
});

export default HomeScreen;