// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// interface Props {
//   title: string;
//   showBackButton?: boolean;
// }

// const CustomHeader: React.FC<Props> = ({ title, showBackButton = true }) => {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       {showBackButton && (
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//       )}
//       <Text style={styles.title}>{title}</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     height: 60,
//     backgroundColor: '#4CAF50',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     elevation: 4,
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   title: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default CustomHeader;
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Props {
  title: string;
  showBackButton?: boolean;
}

const CustomHeader: React.FC<Props> = ({ title, showBackButton = true }) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('Profile'); }}>
              <Text style={styles.menuItem}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('Settings'); }}>
              <Text style={styles.menuItem}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    elevation: 4,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    marginLeft: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    elevation: 5,
    minWidth: 120,
  },
  menuItem: {
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default CustomHeader;

