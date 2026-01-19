import asyncStorage from '@react-native-async-storage/async-storage';

export const localStorage = <T>(key: string, initialValue: T) => {
  const setItem = async (value: T) => {
    const jsonValue = JSON.stringify(value);
    await asyncStorage.setItem(key, jsonValue);
  };

  const getItem = async (): Promise<T | null> => {
    const jsonValue = await asyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : initialValue;
  };

  return { getItem, setItem };
};
