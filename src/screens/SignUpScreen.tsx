import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import theme from '../theme/theme';
import { auth } from '../config/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  OAuthProvider,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

const SignUpScreen: React.FC = () => {
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    // Check if the platform is web
    setIsWeb(Platform.OS === 'web');
  }, []);
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Reset error
    setError(null);

    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signed up:', userCredential.user);
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.error('Sign-up error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-Up success:', result.user);
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.error('Google Sign-Up error:', error.message);
      setError(error.message);
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken, nonce } = credential;
      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });
      const result = await signInWithCredential(auth, authCredential);
      console.log('Apple Sign-Up success:', result.user);
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.error('Apple Sign-Up error:', error.message);
      setError(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {isWeb ? (
        // Web Layout - Two Column Design
        <View style={styles.webContainer}>
          {/* Left Column - Illustration */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.webLeftColumn}>
            <LinearGradient
              colors={[theme.colors.primaryDark, theme.colors.primary]}
              style={styles.webGradientBackground}
            >
              <View style={styles.webLogoContainer}>
                <Ionicons name="leaf" size={60} color="white" />
                <Text style={styles.webLogoText}>Farmer Assistant</Text>
              </View>

              <View style={styles.webIllustrationContainer}>
                <Image
                  source={{ uri: 'https://img.freepik.com/free-vector/organic-farming-concept-illustration_114360-8487.jpg?w=740&t=st=1684567321~exp=1684567921~hmac=7d9a0b5a7bca59ecf9f6d9d36b8f8a35f3eb7a75a2c3d3bc67307f0d7d3e8de1' }}
                  style={styles.webIllustration}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.webFeatures}>
                <View style={styles.webFeatureItem}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.webFeatureText}>Soil Analysis</Text>
                </View>
                <View style={styles.webFeatureItem}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.webFeatureText}>Crop Recommendations</Text>
                </View>
                <View style={styles.webFeatureItem}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.webFeatureText}>Weather Forecasts</Text>
                </View>
                <View style={styles.webFeatureItem}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.webFeatureText}>AI Assistant</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Right Column - Sign Up Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.webRightColumn}>
            <ScrollView contentContainerStyle={styles.webScrollContent}>
              <View style={styles.webFormHeader}>
                <Text style={styles.webFormTitle}>Create Your Account</Text>
                <Text style={styles.webFormSubtitle}>Join thousands of farmers using our platform</Text>
              </View>

              {/* Error Message */}
              {error && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={theme.colors.error} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Email Input */}
              <View style={styles.webInputGroup}>
                <Text style={styles.webInputLabel}>Email Address</Text>
                <View style={styles.webInputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.webInput}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.webInputGroup}>
                <Text style={styles.webInputLabel}>Password</Text>
                <View style={styles.webInputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.webInput}
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.webInputGroup}>
                <Text style={styles.webInputLabel}>Confirm Password</Text>
                <View style={styles.webInputContainer}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color={theme.colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.webInput}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <View style={styles.webTermsContainer}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.webTermsText}>
                  By signing up, you agree to our <Text style={styles.webTermsLink}>Terms of Service</Text> and <Text style={styles.webTermsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.webSignUpButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.webSignUpButtonText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Social Login Section */}
              <View style={styles.webSocialSection}>
                <View style={styles.webDividerContainer}>
                  <View style={styles.webDividerLine} />
                  <Text style={styles.webDividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.webDividerLine} />
                </View>

                <View style={styles.webSocialButtonsContainer}>
                  <TouchableOpacity style={styles.webSocialButton} onPress={handleGoogleSignUp}>
                    <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                    <Text style={styles.webSocialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.webSocialButton} onPress={handleAppleSignUp}>
                    <MaterialCommunityIcons name="apple" size={24} color="#000" />
                    <Text style={styles.webSocialButtonText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Link */}
              <View style={styles.webSignInContainer}>
                <Text style={styles.webSignInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.webSignInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      ) : (
        // Mobile Layout
        <>
          {/* Background Gradient */}
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primary]}
            style={styles.backgroundGradient}
          />

          <View style={styles.innerContainer}>
            {/* Header Section */}
            <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Ionicons name="leaf" size={44} color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Farmer Assistant today</Text>
            </Animated.View>

            {/* Form Container */}
            <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.formContainer}>
              {/* Error Message */}
              {error && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={theme.colors.error} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Social Login Section */}
            <Animated.View entering={FadeInDown.delay(300).duration(700)} style={styles.socialSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialLoginContainer}>
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
                  <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignUp}>
                  <MaterialCommunityIcons name="apple" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Sign In Link */}
            <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
    ...theme.shadows.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  eyeButton: {
    padding: 8,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...theme.shadows.md,
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '600',
  },
  socialSection: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    ...theme.shadows.md,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
  },
  signInLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: theme.typography.fontSizes.md,
  },

  // Web-specific styles
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  webLeftColumn: {
    flex: 1,
    maxWidth: 500,
    height: '100%',
  },
  webGradientBackground: {
    flex: 1,
    padding: 40,
    justifyContent: 'space-between',
  },
  webLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  webLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  webIllustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  webIllustration: {
    width: '100%',
    height: 300,
  },
  webFeatures: {
    marginTop: 40,
  },
  webFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  webFeatureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  webRightColumn: {
    flex: 1.2,
    backgroundColor: theme.colors.background,
    padding: 40,
    justifyContent: 'center',
  },
  webScrollContent: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 40,
  },
  webFormHeader: {
    marginBottom: 32,
  },
  webFormTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  webFormSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  webInputGroup: {
    marginBottom: 24,
  },
  webInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  webInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    transition: '0.3s all',
  },
  webInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 12,
  },
  webTermsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  webTermsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  webTermsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  webSignUpButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...theme.shadows.md,
  },
  webSignUpButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  webSocialSection: {
    width: '100%',
    marginBottom: 32,
  },
  webDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  webDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  webDividerText: {
    marginHorizontal: 16,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  webSocialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  webSocialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 160,
    ...theme.shadows.sm,
  },
  webSocialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 8,
  },
  webSignInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webSignInText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  webSignInLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SignUpScreen;
