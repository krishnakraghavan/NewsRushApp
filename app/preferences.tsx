
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableWithoutFeedback } from 'react-native';
import LanguageSelector from '../src/components/LanguageSelector';
import { getStoredLanguage, setStoredLanguage } from '../src/utils/languageUtils';
import { router } from 'expo-router';

export default function PreferencesScreen() {
  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLang = async () => {
      const lang = await getStoredLanguage();
      setLanguage(lang);
    };
    fetchLang();
  }, []);

  const handleLanguageSelect = async (lang: string) => {
    await setStoredLanguage(lang);
    setLanguage(lang);
    // Optionally navigate back or confirm saved
    router.push('/video');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Preferences</Text>
      <Text style={styles.subheading}>Select Language</Text>
      <LanguageSelector onSelect={handleLanguageSelect} />

      {/* Future Category UI goes here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
  },
});
