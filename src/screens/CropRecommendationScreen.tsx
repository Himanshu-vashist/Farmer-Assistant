import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import API_BASE_URL from '../config/api';
import theme from '../theme/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

interface CropSuggestionResponse {
  suggested_crops: string;
}

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const CropRecommendationScreen: React.FC = () => {
  // State with TypeScript types
  const [N, setN] = useState<string>('');
  const [P, setP] = useState<string>('');
  const [K, setK] = useState<string>('');
  const [pH, setPH] = useState<string>('');
  const [cropSuggestion, setCropSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Fetch crop suggestion
  const getCropSuggestion = async () => {
    if (!N || !P || !K || !pH) {
      setError('Please fill in all soil nutrient fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/crop-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'default', // Using a default value since location is no longer required
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
      setShowResults(true); // Show results section after successful API call
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <Text style={styles.title}>Crop Recommendation</Text>
          <Text style={styles.subtitle}>Get personalized crop suggestions based on soil conditions</Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View entering={FadeInDown.delay(200).duration(800)}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Soil Nutrients</Text>
          <View style={styles.soilInputsGrid}>
            <View style={styles.soilInputContainer}>
              <Input
                label="Nitrogen (N)"
                value={N}
                onChangeText={setN}
                placeholder="e.g. 50"
                keyboardType="numeric"
                icon="leaf-outline"
              />
            </View>
            <View style={styles.soilInputContainer}>
              <Input
                label="Phosphorus (P)"
                value={P}
                onChangeText={setP}
                placeholder="e.g. 30"
                keyboardType="numeric"
                icon="leaf-outline"
              />
            </View>
            <View style={styles.soilInputContainer}>
              <Input
                label="Potassium (K)"
                value={K}
                onChangeText={setK}
                placeholder="e.g. 20"
                keyboardType="numeric"
                icon="leaf-outline"
              />
            </View>
            <View style={styles.soilInputContainer}>
              <Input
                label="pH Level"
                value={pH}
                onChangeText={setPH}
                placeholder="e.g. 6.5"
                keyboardType="decimal-pad"
                icon="flask-outline"
              />
            </View>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            title="Get Crop Recommendations"
            onPress={getCropSuggestion}
            loading={loading}
            disabled={loading || !N || !P || !K || !pH}
            icon="nutrition-outline"
            style={styles.submitButton}
          />
        </Card>
      </Animated.View>

      {/* Crop Suggestion Result */}
      {showResults && (
        <Animated.View entering={FadeInDown.delay(400).duration(800)}>
          <Card title="Recommended Crops" style={styles.resultCard}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Analyzing soil data...</Text>
              </View>
            ) : cropSuggestion ? (
              <>
                <LinearGradient
                  colors={[theme.colors.primaryLighter, theme.colors.background]}
                  style={styles.resultGradient}
                >
                  <View style={styles.resultHeader}>
                    <Ionicons name="ribbon" size={40} color={theme.colors.primary} style={styles.resultHeaderIcon} />
                    <Text style={styles.resultHeaderText}>Best Match for Your Soil</Text>
                  </View>

                  <View style={styles.cropListContainer}>
                    {cropSuggestion.split(',').map((crop, index) => (
                      <View key={index} style={styles.cropItem}>
                        <Ionicons name="leaf" size={24} color={theme.colors.success} style={styles.cropItemIcon} />
                        <Text style={styles.cropItemText}>{crop.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>

                <View style={styles.infoContainer}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.infoText}>
                    These recommendations are based on your soil composition. For best results, consider your local climate and growing season.
                  </Text>
                </View>

                <View style={styles.actionContainer}>
                  <Button
                    title="Start Over"
                    onPress={() => {
                      setN('');
                      setP('');
                      setK('');
                      setPH('');
                      setCropSuggestion(null);
                      setShowResults(false);
                    }}
                    variant="outline"
                    icon="refresh-outline"
                    style={styles.actionButton}
                  />
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
                <Text style={styles.errorText}>Unable to get recommendations. Please try again.</Text>
              </View>
            )}
          </Card>
        </Animated.View>
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
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: '700',
    color: theme.colors.card,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.card,
    opacity: 0.9,
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
  },
  formCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: 0,
  },
  soilInputsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  soilInputContainer: {
    width: isWeb ? '48%' : '100%',
    marginBottom: theme.spacing.md,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  resultCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  resultGradient: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  resultHeaderIcon: {
    marginRight: theme.spacing.md,
  },
  resultHeaderText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cropListContainer: {
    marginLeft: theme.spacing.md,
  },
  cropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  cropItemIcon: {
    marginRight: theme.spacing.md,
  },
  cropItemText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 150,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
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

export default CropRecommendationScreen;