import { ListRenderItemInfo, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Typo } from '@/components/Typo';
import { ThemedView } from '@/components/ThemedView';
import { FlatList } from 'react-native-gesture-handler';
import { Header } from '@react-navigation/elements';
import { DoctorSchedule, useDoctorsSchedule } from '@/hooks/useDoctorsSchedule';
import { useCallback } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '..';

export function Home() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    doctorSchedules: { data, isLoading },
  } = useDoctorsSchedule();

  const onViewSchedule = useCallback(
    (index: number) => {
      if (data && data[index]) {
        navigation.navigate('ScheduleModal', { doctorName: data[index].name });
      }
    },
    [data, navigation],
  );

  const renderCell = useCallback(
    ({ item, index }: ListRenderItemInfo<DoctorSchedule>) => (
      <TouchableOpacity onPress={() => onViewSchedule(index)}>
        <ThemedView style={styles.doctorItem}>
          <Typo type="subtitle">{item.name}</Typo>
          <Typo>Timezone: {item.timezone}</Typo>
        </ThemedView>
      </TouchableOpacity>
    ),
    [onViewSchedule],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Typo>Loading...</Typo>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Available Doctors" />
      <FlatList
        data={data ?? []}
        style={styles.listContainer}
        renderItem={renderCell}
        keyExtractor={(_item, index) => index.toString()}
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
