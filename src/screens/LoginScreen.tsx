import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import theme from '../theme/theme';
import { auth } from '../config/firebaseConfig';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MainTabs: undefined;
  SignUp: undefined;
  Login: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Function to display messages
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('Welcome back, Farmer!', 'success');
      setTimeout(() => navigation.navigate('MainTabs'), 500); // Slight delay for message visibility
    } catch (error: any) {
      showMessage('Incorrect email or password. Please try again.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showMessage('Google Sign-In Successful!', 'success');
      setTimeout(() => navigation.navigate('MainTabs'), 500);
    } catch (error: any) {
      showMessage(`Google Sign-In Error: ${error.message}`, 'error');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: credential.identityToken!,
        rawNonce: credential.nonce!,
      });

      await signInWithCredential(auth, authCredential);
      showMessage('Apple Sign-In Successful!', 'success');
      setTimeout(() => navigation.navigate('MainTabs'), 500);
    } catch (error: any) {
      showMessage(`Apple Sign-In Error: ${error.message}`, 'error');
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      showMessage('Exploring as Guest Farmer!', 'success');
      setTimeout(() => navigation.navigate('MainTabs'), 500);
    } catch (error: any) {
      showMessage(`Guest Login Error: ${error.message}`, 'error');
    }
  };

  const [loading, setLoading] = useState(false);

  const handleLoginWithLoading = async () => {
    setLoading(true);
    try {
      await handleLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        style={styles.backgroundGradient}
      />

      {/* Content */}
      <View style={styles.innerContainer}>
        {/* Success/Error Message */}
        {message && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[
              styles.messageBox,
              messageType === 'success' ? styles.success : styles.error,
            ]}
          >
            <Ionicons
              name={messageType === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.messageText}>{message}</Text>
          </Animated.View>
        )}

        {/* Logo and Title Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/farmer-assistant-logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Farmer Assistant</Text>
          <Text style={styles.subtitle}>Login to grow smarter</Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.formContainer}>
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
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginWithLoading}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Social Login Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(700)} style={styles.socialSection}>
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialLoginContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
              <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
              <MaterialCommunityIcons name="apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Guest Login */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Ionicons name="person-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.signUpContainer}>
          <Text style={styles.signUpText}>New to Farmer Assistant? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.md,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  messageText: {
    color: '#FFF',
    fontSize: theme.typography.fontSizes.md,
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.md,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
  },
  title: {
    fontSize: theme.typography.fontSizes['3xl'],
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  loginButtonText: {
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
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: 12,
    ...theme.shadows.md,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  guestButtonText: {
    color: '#FFF',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
  },
  signUpLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: theme.typography.fontSizes.md,
  },
});

export default LoginScreen;