// src/components/HeaderWithLanguage.tsx
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onLanguagePress: () => void;
}

const HeaderWithLanguage: React.FC<Props> = ({ onLanguagePress }) => {
  return (
    <View style={styles.header}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <TouchableOpacity onPress={onLanguagePress} style={styles.iconContainer}>
        <Ionicons name="globe-outline" size={26} color="#111" />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderWithLanguage;

const styles = StyleSheet.create({
  header: {
    height: 70,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#808080',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
  width: 300,
  height: 200,
  resizeMode: 'contain',
  marginTop: 0
},
  iconContainer: {
    padding: 6
  }
});
