import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Doctor } from '@/types/index';
import { use } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@react-navigation/elements';


const fetchData = async () : Promise<Doctor[]> => { 
  const response = await fetch('https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json');
  return response.json();
}

export function Home() {

  const {data, isLoading} = useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: fetchData,
  });

  if (isLoading) {
    return (<View style={styles.container}>
      <ThemedText>Loading...</ThemedText>
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Available Doctors" />
      <FlatList data={data}
        style={styles.listContainer}
        renderItem={({item}) => (
          <ThemedView style={styles.doctorItem} >
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText>Timezone: {item.timezone}</ThemedText>
            <ThemedText>Day of Week: {item.day_of_week}</ThemedText>
            <ThemedText>Available At: {item.available_at}</ThemedText>
            <ThemedText>Available Until: {item.available_until}</ThemedText>
          </ThemedView>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContainer: { 
    padding: 16,
  },

  doctorItem: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
});
