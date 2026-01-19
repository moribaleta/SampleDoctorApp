import { ThemedView } from '@/components/ThemedView';
import { Typo } from '@/components/Typo';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StyleSheet, FlatList, Alert } from 'react-native';
import { RootStackParamList } from '..';
import { Schedule, Timeslot, useDoctorsSchedule } from '@/hooks/useDoctorsSchedule';
import { useMemo } from 'react';
import { ScheduleCollapsible } from '@/components/ScheduleCollapsible';

type ScheduleModalRouteProp = RouteProp<RootStackParamList, 'ScheduleModal'>;

export const ScheduleModal = () => {
  const route = useRoute<ScheduleModalRouteProp>();
  const navigation = useNavigation();
  const { doctorName } = route.params;
  const { userBookedSchedules, getDoctorByName, bookSchedule } = useDoctorsSchedule();

  const bookedTimeslots = useMemo(() => {
    return userBookedSchedules.data?.reduce<Record<string, Timeslot[]>>((acc, schedule) => {
      if (!acc[schedule.dayOfWeek]) {
        acc[schedule.dayOfWeek] = [];
      }
      acc[schedule.dayOfWeek].push(schedule.timeslot);
      return acc;
    }, {});
  }, [userBookedSchedules.data]);

  const timeslotAlreadyBooked = (dayOfWeek: string, timeslot: Timeslot) => {
    return userBookedSchedules.data?.some(
      (schedule) =>
        schedule.dayOfWeek === dayOfWeek &&
        schedule.timeslot.timeStart === timeslot.timeStart &&
        schedule.timeslot.timeEnd === timeslot.timeEnd,
    );
  };

  const handleSetSchedule = (dayOfWeek: string, timeslot: Timeslot) => {
    if (!doctorName) return;

    //schedule already booked
    if (timeslotAlreadyBooked(dayOfWeek, timeslot)) {
      Alert.alert('Schedule already booked', 'You have already booked this schedule.');
      return;
    }

    bookSchedule({
      doctorName,
      dayOfWeek,
      timeslot,
    });

    navigation.goBack();
  };

  const doctorWithSchedules = useMemo(() => {
    return doctorName ? getDoctorByName(doctorName) : undefined;
  }, [doctorName, getDoctorByName]);

  const renderCell = (schedule: Schedule) => {
    return (
      <ScheduleCollapsible
        key={schedule.dayOfWeek}
        dayOfWeek={schedule.dayOfWeek}
        availableAt={schedule.availableAt}
        availableUntil={schedule.availableUntil}
        timeslots={schedule.timeslots}
        onSelect={handleSetSchedule}
        bookedTimeslots={bookedTimeslots?.[schedule.dayOfWeek]}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <Typo type="title">{doctorWithSchedules?.name}</Typo>
        <Typo type="subtitle">Timezone: {doctorWithSchedules?.timezone}</Typo>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <Typo type="subtitle">Select a schedule:</Typo>
        <FlatList
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          data={doctorWithSchedules?.schedules}
          keyExtractor={(_item, index) => index.toString()}
          renderItem={({ item }) => renderCell(item)}
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },

  headerContainer: {
    gap: 8,
  },

  contentContainer: {
    flex: 1,
    gap: 12,
  },

  listContainer: {
    flex: 1,
    gap: 12,
  },

  listContentContainer: {
    gap: 12,
  },
});
