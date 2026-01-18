import asyncStorage from '@react-native-async-storage/async-storage';

export const useLocaleStorage = <T>(key: string, initialValue: T) => {
  const setItem = async (value: T) => {
    try {
      const jsonValue = JSON.stringify(value);
      await asyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error setting item in locale storage', e);
    }
  };

  const getItem = async (): Promise<T | null> => {
    try {
      const jsonValue = await asyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : initialValue;
    } catch (e) {
      console.error('Error getting item from locale storage', e);
      return null;
    }
  };

  return { getItem, setItem };
};
