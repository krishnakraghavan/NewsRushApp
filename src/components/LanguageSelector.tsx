// src/components/LanguageSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onSelect: (lang: string) => void;
}

const languages = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'te', label: '🇮🇳 Telugu' }
];

const LanguageSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose Your Language</Text>
      {languages.map((lang) => (
        <TouchableOpacity key={lang.code} style={styles.button} onPress={() => onSelect(lang.code)}>
          <Text style={styles.buttonText}>{lang.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LanguageSelector;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  heading: {
    color: 'white',
    fontSize: 22,
    marginBottom: 20,
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 6,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  }
});
