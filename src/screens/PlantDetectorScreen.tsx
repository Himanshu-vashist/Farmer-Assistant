import React, { useState, useRef } from 'react';
import axios from 'axios';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// Audio functionality removed for web compatibility
import theme from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

interface DiagnosisItem {
  text: string;
  date: string;
  language: string;
}

interface ExpandedState {
  [key: number]: boolean;
}

const PlantDetectorScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [history, setHistory] = useState<DiagnosisItem[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [expandedDiagnoses, setExpandedDiagnoses] = useState<ExpandedState>({});
  // Audio state removed for web compatibility

  // Request camera permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to use this feature');
      return false;
    }
    return true;
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo');
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setError('');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image');
    }
  };

  // Classify the image
  const handleClassify = async () => {
    if (!image) {
      setError('Please select or take a plant image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create form data
      const formData = new FormData();
      const filename = image.split('/').pop() || 'image.jpg';
      const fileType = filename.split('.').pop()?.toLowerCase() || 'jpg';

      // @ts-ignore - FormData in React Native works differently than in web
      formData.append('image', {
        uri: image,
        name: filename,
        type: `image/${fileType}`,
      });
      formData.append('language', language);

      // Send request to backend
      const backendUrl = Platform.OS === 'web' ? 'http://localhost:8000' : 'http://10.0.2.2:8000';
      const response = await axios.post(`${backendUrl}/classify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      const { diagnosis: diagnosisText, audio } = response.data;
      setDiagnosis(diagnosisText);

      // Audio functionality removed for web compatibility
      if (audio) {
        setAudioUrl(`data:audio/mp3;base64,${audio}`);
      }

      // Add to history
      const newHistoryItem: DiagnosisItem = {
        text: diagnosisText,
        date: new Date().toLocaleString(),
        language: language,
      };

      setHistory([newHistoryItem, ...history.slice(0, 4)]);
    } catch (err: any) {
      console.error('Error classifying image:', err);
      setError(`Classification failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    setAudioUrl(null);
  };

  // Toggle expanded state for history items
  const toggleExpand = (index: number) => {
    setExpandedDiagnoses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        style={styles.headerGradient}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.title}>Plant Disease Detector</Text>
          <Text style={styles.subtitle}>Upload a plant image to identify diseases</Text>
        </Animated.View>

        {/* Image Selection */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.imageSection}>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                <Ionicons name="refresh-outline" size={20} color="white" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageSelectionContainer}>
              <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
                <Text style={styles.imagePickerText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={32} color={theme.colors.primary} />
                <Text style={styles.imagePickerText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Language Selection */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Diagnosis Language</Text>
          <View style={styles.languageButtons}>
            {['English', 'Hindi', 'Bengali'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  language === lang && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === lang && styles.languageButtonTextActive,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Classify Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.classifySection}>
          <TouchableOpacity
            style={[styles.classifyButton, loading && styles.classifyButtonDisabled]}
            onPress={handleClassify}
            disabled={loading || !image}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="search-outline" size={24} color="white" style={styles.classifyIcon} />
                <Text style={styles.classifyText}>Analyze Plant</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Error Message */}
        {error ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color={theme.colors.error} style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {/* Diagnosis Result */}
        {diagnosis ? (
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons name="leaf-outline" size={24} color={theme.colors.primary} style={styles.resultIcon} />
              <Text style={styles.resultTitle}>Diagnosis Result</Text>
            </View>
            <Text style={styles.diagnosisText}>{diagnosis}</Text>
          </Animated.View>
        ) : null}

        {/* History Section */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Previous Diagnoses</Text>
            <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
              <Text style={styles.toggleHistoryText}>
                {showHistory ? 'Hide History' : 'Show History'}
              </Text>
            </TouchableOpacity>
          </View>

          {showHistory && (
            <View style={styles.historyList}>
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <View key={idx} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemTitle}>Diagnosis #{idx + 1}</Text>
                      <TouchableOpacity onPress={() => toggleExpand(idx)}>
                        <Text style={styles.expandCollapseText}>
                          {expandedDiagnoses[idx] ? 'Collapse' : 'Expand'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.historyItemDate}>{item.date} • {item.language}</Text>
                    <Text style={styles.historyItemText} numberOfLines={expandedDiagnoses[idx] ? undefined : 3}>
                      {item.text}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyHistoryText}>No previous diagnoses</Text>
              )}

              {history.length > 0 && (
                <TouchableOpacity style={styles.clearHistoryButton} onPress={handleClearHistory}>
                  <Ionicons name="trash-outline" size={20} color="white" style={styles.clearHistoryIcon} />
                  <Text style={styles.clearHistoryText}>Clear History</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    ...theme.shadows.md,
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    width: '45%',
  },
  imagePickerText: {
    marginTop: 8,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.md,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  changeImageText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  languageSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.colors.text,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  languageButtonText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: 'white',
  },
  classifySection: {
    marginBottom: 24,
  },
  classifyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  classifyButtonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  classifyIcon: {
    marginRight: 8,
  },
  classifyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorIcon: {
    marginRight: 12,
  },
  errorText: {
    color: theme.colors.error,
    flex: 1,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  diagnosisText: {
    color: theme.colors.text,
    lineHeight: 22,
  },
  historySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleHistoryText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  historyList: {
    marginTop: 8,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  expandCollapseText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  historyItemDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  historyItemText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  emptyHistoryText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  clearHistoryButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  clearHistoryIcon: {
    marginRight: 8,
  },
  clearHistoryText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default PlantDetectorScreen;