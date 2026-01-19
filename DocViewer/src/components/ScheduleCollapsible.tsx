import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Typo } from '@/components/Typo';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Schedule, Timeslot } from '@/hooks/useDoctorsSchedule';

type ScheduleCollapsibleProps = Schedule & {
  timeslots: Timeslot[];
  onSelect: (dayOfWeek: string, timeslot: Timeslot) => void;
  bookedTimeslots?: Timeslot[];
};

export const ScheduleCollapsible = ({
  dayOfWeek,
  availableAt,
  availableUntil,
  timeslots,
  onSelect,
  bookedTimeslots,
}: ScheduleCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const isTimeslotBooked = useCallback(
    (timeslot: Timeslot) => {
      return bookedTimeslots?.some(
        (booked) => booked.timeStart === timeslot.timeStart && booked.timeEnd === timeslot.timeEnd,
      );
    },
    [bookedTimeslots],
  );

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <View style={styles.headingContent}>
          <Typo type="subtitle">{dayOfWeek}</Typo>
          <Typo type="default">{`${availableAt} - ${availableUntil}`}</Typo>
        </View>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={styles.content}>
          {timeslots.map((slot) => (
            <TouchableOpacity
              key={slot.timeStart}
              onPress={() => onSelect(dayOfWeek, { ...slot })}
              disabled={isTimeslotBooked(slot)}
            >
              <ThemedView style={styles.listItem} lightColor="#e0e0e0" darkColor="#2a2a2a">
                <Typo
                  type="default"
                  style={{ textDecorationLine: isTimeslotBooked(slot) ? 'line-through' : 'none' }}
                >{`${slot.timeStart} - ${slot.timeEnd}`}</Typo>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  headingContent: {
    flexDirection: 'column',
    gap: 4,
  },

  content: {
    marginTop: 6,
    marginLeft: 24,
  },

  listItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});
