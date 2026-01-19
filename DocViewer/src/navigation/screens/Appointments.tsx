import { FlatList, StyleSheet, View } from 'react-native';

import { Typo } from '@/components/Typo';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@react-navigation/elements';
import { useDoctorsSchedule, UserBookedSchedule } from '@/hooks/useDoctorsSchedule';
import { IconButton } from '@/components/IconButton';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { alert } from '@/components/ui/Alert';

const DAY_OF_WEEK_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export function Appointments() {
  const {
    userBookedSchedules: { data, isLoading },
    cancelSchedule,
  } = useDoctorsSchedule();

  const viewBookedSchedules = useMemo(() => {
    const dayOrderMap = DAY_OF_WEEK_ORDER.reduce<Record<string, UserBookedSchedule[]>>(
      (acc, day) => {
        acc[day] = [];
        return acc;
      },
      {},
    );

    (data ?? []).forEach((schedule) => {
      const day = schedule.dayOfWeek;
      const list = dayOrderMap[day];
      list.push(schedule);
    });

    Object.keys(dayOrderMap).forEach((day) => {
      dayOrderMap[day].sort((a, b) => {
        const timeA = dayjs(a.timeslot.timeStart, 'h:mmA').format('HH:mm');
        const timeB = dayjs(b.timeslot.timeStart, 'h:mmA').format('HH:mm');
        return timeA.localeCompare(timeB);
      });
    });

    return Object.values(dayOrderMap).flat();
  }, [data]);

  const handleCancelSchedule = (schedule: UserBookedSchedule) => {
    alert('Cancel Schedule', 'Are you sure you want to cancel this schedule?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          cancelSchedule(schedule);
        },
      },
    ]);
  };

  const renderCell = ({ item }: { item: UserBookedSchedule }) => (
    <ThemedView style={styles.doctorItem}>
      <View style={styles.doctorItemInfo}>
        <Typo type="subtitle">{item.doctorName}</Typo>
        <Typo>
          {item.dayOfWeek}: {item.timeslot.timeStart} - {item.timeslot.timeEnd}
        </Typo>
      </View>
      <IconButton name="close" onPress={() => handleCancelSchedule(item)} />
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
        data={viewBookedSchedules}
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
