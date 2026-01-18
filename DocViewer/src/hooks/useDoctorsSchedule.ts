import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocaleStorage } from './useLocaleStorage';

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
  day_of_week: string;
  available_at: string;
  available_until: string;
};

export type UserBookedSchedule = {
  doctorName: string;
  schedule: Schedule;
};

const fetchData = async (): Promise<DoctorSchedule[]> => {
  const response = await fetch(
    'https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json',
  );
  const result: DoctorFetchResults[] = await response.json();

  const doctorSchedules = new Map<string, DoctorSchedule>();

  result.forEach((entry) => {
    const schedule = {
      day_of_week: entry.day_of_week,
      available_at: entry.available_at,
      available_until: entry.available_until,
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

export const useDoctorsSchedule = () => {
  const { getItem, setItem } = useLocaleStorage<{ [doctorName: string]: Schedule }>(
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
      return Object.entries(items).map(([doctorName, schedule]) => ({ doctorName, schedule }));
    },
  });

  const mutateSelectedSchedules = useMutation<
    void,
    unknown,
    { doctorName: string; schedule: Schedule }
  >({
    mutationFn: async ({ doctorName, schedule }) => {
      const prevItems = await getItem();
      await setItem({ ...prevItems, [doctorName]: schedule });
    },
    onSettled: () => {
      queryUserBookedSchedules.refetch();
    },
  });

  const mutateDeleteSchedule = useMutation<void, unknown, { doctorName: string }>({
    mutationFn: async ({ doctorName }) => {
      const prevItems = await getItem();
      if (prevItems && doctorName in prevItems) {
        const { [doctorName]: _, ...rest } = prevItems;
        await setItem(rest);
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
    setSchedule: mutateSelectedSchedules.mutate,
    deleteSchedule: mutateDeleteSchedule.mutate,
    getDoctorByName,
  };
};
