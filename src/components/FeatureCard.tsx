// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// interface Props {
//   title: string;
//   onPress: () => void;
// }

// const FeatureCard: React.FC<Props> = ({ title, onPress }) => (
//   <TouchableOpacity style={styles.card} onPress={onPress}>
//     <Text style={styles.cardText}>{title}</Text>
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   card: {
//     flex: 1,
//     margin: 10,
//     padding: 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//   },
//   cardText: { fontSize: 16, fontWeight: '600', color: '#333' },
// });

// export default FeatureCard;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  title: string;
  icon: string;
  onPress: () => void;
  style?: any;
}

const FeatureCard: React.FC<Props> = ({ title, icon, onPress, style }) => {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <TouchableOpacity
        style={[styles.container, style, Platform.OS === 'web' && styles.webHover]}
        onPress={onPress}
      >
        <Icon name={icon} size={40} color="#4CAF50" />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webHover: {
    transitionProperty: 'transform',
    transitionDuration: '0.2s',
    // Note: React Native Web supports limited CSS transitions
    // For full hover effects, you may need additional libraries or custom logic
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default FeatureCard;