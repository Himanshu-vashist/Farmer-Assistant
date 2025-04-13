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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { RootStackParamList } from './Navigation'; // Adjust the import path as needed

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
      setTimeout(() => navigation.navigate('Home'), 500); // Slight delay for message visibility
    } catch (error: any) {
      showMessage('Incorrect email or password. Please try again.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showMessage('Google Sign-In Successful!', 'success');
      setTimeout(() => navigation.navigate('Home'), 500);
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
      setTimeout(() => navigation.navigate('Home'), 500);
    } catch (error: any) {
      showMessage(`Apple Sign-In Error: ${error.message}`, 'error');
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      showMessage('Exploring as Guest Farmer!', 'success');
      setTimeout(() => navigation.navigate('Home'), 500);
    } catch (error: any) {
      showMessage(`Guest Login Error: ${error.message}`, 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Success/Error Message */}
        {message && (
          <View
            style={[
              styles.messageBox,
              messageType === 'success' ? styles.success : styles.error,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Logo */}
        <Image
          source={require('../assets/farmer-assistant-logo.jpg')} // Same logo as SignUpScreen
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Farmer Assistant</Text>
        <Text style={styles.subtitle}>Login to grow smarter</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email"
            size={20}
            color="#6B4E31"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8D6E63"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="lock"
            size={20}
            color="#6B4E31"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8D6E63"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#6B4E31"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

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
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>New to Farmer Assistant? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light earthy background
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05, // Responsive padding
    paddingVertical: height * 0.02,
  },
  messageBox: {
    padding: 10,
    borderRadius: 5,
    marginBottom: height * 0.02,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  success: {
    backgroundColor: '#689F38', // Green for success
  },
  error: {
    backgroundColor: '#D32F2F', // Red for error
  },
  messageText: {
    color: '#FFF',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  logo: {
    width: width * 0.25, // Responsive logo size
    height: width * 0.25,
    marginBottom: height * 0.03,
    borderRadius: 12,
  },
  title: {
    fontSize: width * 0.07, // Responsive font size
    fontWeight: 'bold',
    color: '#4A2F1B', // Earthy brown
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#6B4E31', // Muted brown
    marginBottom: height * 0.04,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400, // Limit width on larger screens
    borderWidth: 1,
    borderColor: '#A1887F', // Earthy border
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: height * 0.025,
    backgroundColor: '#FFF8E1', // Light cream background
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: height * 0.06, // Responsive height
    fontSize: width * 0.04,
    color: '#4A2F1B',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.02,
  },
  forgotPasswordText: {
    color: '#689F38', // Green for links
    fontSize: width * 0.035,
  },
  loginButton: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#689F38', // Green for farming
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  guestButton: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#8D6E63', // Muted brown for guest button
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  guestButtonText: {
    color: '#FFF',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginVertical: height * 0.025,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#A1887F',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6B4E31',
    fontSize: width * 0.04,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '40%',
    maxWidth: 200,
    marginBottom: height * 0.025,
  },
  socialButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#A1887F',
    borderRadius: 50,
    width: width * 0.12,
    height: width * 0.12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    marginHorizontal: width * 0.02,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  signUpText: {
    color: '#6B4E31',
    fontSize: width * 0.04,
  },
  signUpLink: {
    color: '#689F38',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
});

export default LoginScreen;