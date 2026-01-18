import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocaleStorage } from './useLocaleStorage';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type DoctorFetchResults = {
  name: string;
  timezone: string;
  day_of_week: string;
  available_at: string;
  available_until: string;
};

export type DoctorSchedule = {
  name: string;
  timezone: string;
  schedules: Schedule[];
};

export type Schedule = {
  dayOfWeek: string;
  availableAt: string;
  availableUntil: string;
  timeslots: Timeslot[];
};

export type UserBookedSchedule = {
  doctorName: string;
  dayOfWeek: string;
  timeslot: Timeslot;
};

export type Timeslot = {
  timeStart: string;
  timeEnd: string;
};

const fetchData = async (): Promise<DoctorSchedule[]> => {
  const response = await fetch(
    'https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json',
  );
  const result: Partial<DoctorFetchResults>[] = await response.json();

  const doctorSchedules = new Map<string, DoctorSchedule>();

  result
    .filter((entry): entry is DoctorFetchResults => {
      const isValid =
        entry.name !== undefined &&
        entry.timezone !== undefined &&
        entry.day_of_week !== undefined &&
        entry.available_at !== undefined &&
        entry.available_until !== undefined;

      if (!isValid) {
        console.warn('Invalid entry found and skipped:', entry);
      }

      return isValid;
    })
    .map((entry) => ({ ...entry }) as DoctorFetchResults)
    .forEach((entry) => {
      const schedule: Schedule = {
        dayOfWeek: entry.day_of_week,
        availableAt: entry.available_at,
        availableUntil: entry.available_until,
        timeslots: generateTimeslot(entry.day_of_week, entry.available_at, entry.available_until),
      };

      if (!doctorSchedules.has(entry.name)) {
        doctorSchedules.set(entry.name, {
          name: entry.name,
          timezone: entry.timezone,
          schedules: [schedule],
        });
      } else {
        const doctorSchedule = doctorSchedules.get(entry.name);
        doctorSchedule?.schedules.push(schedule);
      }
    });

  return Array.from(doctorSchedules.values());
};

const generateTimeslot = (
  dayOfWeek: string,
  availableAt: string,
  availableUntil: string,
): Timeslot[] => {
  const startTime = dayjs(availableAt, 'h:mmA');
  const endTime = dayjs(availableUntil, 'h:mmA');
  const timeslots: Timeslot[] = [];
  let current = dayjs(startTime);

  if (!startTime.isValid() || !endTime.isValid()) {
    console.warn(
      `Invalid time format for schedule: ${dayOfWeek}, availableAt: ${availableAt}, availableUntil: ${availableUntil}`,
    );
    return timeslots;
  }

  current = current.add(30, 'minute'); // Reset to start time

  while (current.add(30, 'minute').isBefore(endTime) || current.add(30, 'minute').isSame(endTime)) {
    const slot: Timeslot = {
      timeStart: current.format('h:mmA'),
      timeEnd: current.add(30, 'minute').format('h:mmA'),
    };

    timeslots.push(slot);
    current = current.add(30, 'minute');
  }

  return timeslots;
};

export const useDoctorsSchedule = () => {
  const { getItem, setItem } = useLocaleStorage<{ [doctorName: string]: UserBookedSchedule[] }>(
    'selectedSchedules',
    {},
  );

  const queryDoctorSchedule = useQuery<DoctorSchedule[]>({
    queryKey: ['doctors'],
    queryFn: fetchData,
  });

  const queryUserBookedSchedules = useQuery<UserBookedSchedule[]>({
    queryKey: ['userBookedSchedules'],
    queryFn: async () => {
      const items = (await getItem()) ?? {};
      return Object.values(items).flat();
    },
  });

  const mutateBookSchedule = useMutation<void, unknown, UserBookedSchedule>({
    mutationFn: async ({ doctorName, dayOfWeek, timeslot }) => {
      const prevItems = await getItem();
      await setItem({
        ...prevItems,
        [doctorName]: [
          ...(prevItems?.[doctorName] ?? []),
          {
            doctorName,
            dayOfWeek,
            timeslot,
          },
        ],
      });
    },
    onSettled: () => {
      queryUserBookedSchedules.refetch();
    },
  });

  const mutateCancelSchedule = useMutation<
    void,
    unknown,
    { doctorName: string; timeslot: Timeslot }
  >({
    mutationFn: async ({ doctorName, timeslot }) => {
      const prevItems = await getItem();
      if (!prevItems || !prevItems[doctorName]) {
        return;
      }

      const schedules = prevItems[doctorName].filter(
        (item) =>
          timeslot.timeStart !== item.timeslot.timeStart &&
          timeslot.timeEnd !== item.timeslot.timeEnd,
      );

      if (schedules.length === 0) {
        const { [doctorName]: _, ...rest } = prevItems;
        await setItem(rest);
      } else {
        await setItem({
          ...prevItems,
          [doctorName]: schedules,
        });
      }
    },
    onSettled: () => {
      queryUserBookedSchedules.refetch();
    },
  });

  const getDoctorByName = (name: string): DoctorSchedule | undefined => {
    return queryDoctorSchedule.data?.find((doctor) => doctor.name === name);
  };

  return {
    doctorSchedules: { data: queryDoctorSchedule.data, isLoading: queryDoctorSchedule.isLoading },
    userBookedSchedules: {
      data: queryUserBookedSchedules.data,
      isLoading: queryUserBookedSchedules.isLoading,
    },
    bookSchedule: mutateBookSchedule.mutate,
    cancelSchedule: mutateCancelSchedule.mutate,
    getDoctorByName,
  };
};
