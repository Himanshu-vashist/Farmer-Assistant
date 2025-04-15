import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { updateProfile, updatePassword } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../config/firebaseConfig';

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const ProfileScreen: React.FC = () => {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(defaultAvatar);

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
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (user) {
        await updateProfile(user, { displayName: name, photoURL: avatar });
        Alert.alert('Success', 'Profile updated');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (user && password.length >= 6) {
        await updatePassword(user, password);
        Alert.alert('Success', 'Password updated');
      } else {
        Alert.alert('Error', 'Password should be at least 6 characters');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickAvatar}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.changeAvatarText}>Change Avatar</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          placeholder="Enter new name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Update Name</Text>
        </TouchableOpacity>

        <Text style={styles.label}>New Password</Text>
        <TextInput
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changeAvatarText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileScreen;
