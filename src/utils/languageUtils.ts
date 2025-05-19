// src/utils/languageUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('selectedLanguage');
  } catch (e) {
    console.error('Failed to get language from storage', e);
    return null;
  }
};

export const setStoredLanguage = async (lang: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('selectedLanguage', lang);
  } catch (e) {
    console.error('Failed to save language to storage', e);
  }
};
