import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { updateProfile, updatePassword, signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { auth } from '../config/firebaseConfig';
import theme from '../theme/theme';

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const ProfileScreen: React.FC = () => {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.photoURL || defaultAvatar);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  const [editMode, setEditMode] = useState(false);

  // Stats for the profile
  const [stats, setStats] = useState({
    soilTests: 5,
    cropRecommendations: 12,
    plantDetections: 8,
    weatherChecks: 24
  });

  useEffect(() => {
    // Update user info if auth changes
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setAvatar(user.photoURL || defaultAvatar);
    }
  }, [user]);

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Camera roll permissions are required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: name, photoURL: avatar });
        Alert.alert('Success', 'Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (user && password.length >= 6) {
        await updatePassword(user, password);
        Alert.alert('Success', 'Password updated successfully');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Password should be at least 6 characters');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Navigation will be handled by the auth state listener
    } catch (error) {
      Alert.alert('Error signing out', (error as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrapper}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera-outline" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{name || 'Farmer'}</Text>
            <Text style={styles.userEmail}>{email || 'No email provided'}</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={activeTab === 'profile' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}
            >
              Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'security' && styles.activeTabButton]}
            onPress={() => setActiveTab('security')}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={activeTab === 'security' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}
            >
              Security
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            {/* Profile Information Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleUpdateProfile}
                >
                  <Ionicons
                    name={editMode ? "checkmark-outline" : "create-outline"}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.editButtonText}>
                    {editMode ? "Save" : "Edit"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, editMode ? styles.inputEditable : styles.inputDisabled]}
                  editable={editMode}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  style={styles.inputDisabled}
                  editable={false}
                />
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>
            </View>

            {/* Stats Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Activity</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success }]}>
                    <Ionicons name="leaf-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.soilTests}</Text>
                  <Text style={styles.statLabel}>Soil Tests</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.warning }]}>
                    <Ionicons name="nutrition-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.cropRecommendations}</Text>
                  <Text style={styles.statLabel}>Crop Recs</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.info }]}>
                    <Ionicons name="scan-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.plantDetections}</Text>
                  <Text style={styles.statLabel}>Plant Scans</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.secondary }]}>
                    <Ionicons name="cloud-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.statValue}>{stats.weatherChecks}</Text>
                  <Text style={styles.statLabel}>Weather</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Security Tab Content */}
        {activeTab === 'security' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  placeholder="Enter new password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account Actions</Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.dangerButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...theme.shadows.md,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.card,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.card,
    opacity: 0.8,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    ...theme.shadows.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  activeTabButton: {
    backgroundColor: theme.colors.background,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Cards
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // Form elements
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  inputEditable: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    color: theme.colors.textSecondary,
  },
  helperText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // Buttons
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  editButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
});

export default ProfileScreen;
