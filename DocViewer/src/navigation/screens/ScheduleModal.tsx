import { ThemedView } from '@/components/ThemedView';
import { Typo } from '@/components/Typo';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RootStackParamList } from '..';
import { Schedule, useDoctorsSchedule } from '@/hooks/useDoctorsSchedule';
import { useMemo } from 'react';

type ScheduleModalRouteProp = RouteProp<RootStackParamList, 'ScheduleModal'>;

export const ScheduleModal = () => {
  const route = useRoute<ScheduleModalRouteProp>();
  const navigation = useNavigation();
  const { doctorName } = route.params;
  const { getDoctorByName, setSchedule } = useDoctorsSchedule();

  const handleSetSchedule = (schedule: Schedule) => {
    if (doctorName) {
      setSchedule({ doctorName, schedule });
    }

    navigation.goBack();
  };

  const doctor = useMemo(() => {
    return doctorName ? getDoctorByName(doctorName) : undefined;
  }, [doctorName, getDoctorByName]);

  return (
    <View style={styles.internalModalContainer}>
      {doctor && (
        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.subtitleContainer}>
            <Typo type="title">{doctor?.name}</Typo>
            <Typo type="subtitle">Timezone: {doctor?.timezone}</Typo>
          </ThemedView>

          <ThemedView style={styles.listContainer}>
            <Typo type="subtitle">Select a schedule:</Typo>
            {doctor &&
              doctor.schedules.map((schedule, index) => (
                <TouchableOpacity onPress={() => handleSetSchedule(schedule)} key={index}>
                  <ThemedView style={styles.listItem} lightColor="#f0f0f0" darkColor="#1a1a1a">
                    <Typo type="subtitle">{schedule.day_of_week}</Typo>
                    <Typo>
                      Available from {schedule.available_at} to {schedule.available_until}
                    </Typo>
                  </ThemedView>
                </TouchableOpacity>
              ))}
          </ThemedView>
        </ThemedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  internalModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },

  contentContainer: {
    flexShrink: 1,
    borderRadius: 8,
    gap: 16,
    padding: 24,
  },

  headerContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitleContainer: {
    marginBottom: 16,
  },

  listContainer: {
    gap: 12,
  },

  listItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
  },
});
