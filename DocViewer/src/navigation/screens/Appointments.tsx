import { FlatList, StyleSheet, View } from 'react-native';

import { Typo } from '@/components/Typo';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@react-navigation/elements';
import { useDoctorsSchedule, UserBookedSchedule } from '@/hooks/useDoctorsSchedule';
import { IconButton } from '@/components/IconButton';

export function Appointments() {
  const {
    userBookedSchedules: { data, isLoading },
    deleteSchedule,
  } = useDoctorsSchedule();

  const renderCell = ({ item }: { item: UserBookedSchedule }) => (
    <ThemedView style={styles.doctorItem}>
      <View style={styles.doctorItemInfo}>
        <Typo type="subtitle">{item.doctorName}</Typo>
        <Typo>
          {item.schedule.day_of_week}: {item.schedule.available_at} -{' '}
          {item.schedule.available_until}
        </Typo>
      </View>
      <IconButton name="close" onPress={() => deleteSchedule({ doctorName: item.doctorName })} />
    </ThemedView>
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
      <Header title="Schedule Appointments" />
      <FlatList
        data={data}
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  doctorItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  doctorItemInfo: {
    flex: 1,
  },
});
