import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { localStorage } from './localStorage';
import { fetchDoctorData, generateTimeslot, useDoctorsSchedule } from './useDoctorsSchedule';

jest.mock('./localStorage', () => ({
  localStorage: jest.fn(),
}));

describe('useDoctorsSchedule', () => {
  const mockFetch = (responseData: any) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(responseData),
      }),
    ) as jest.Mock;
  };

  describe('fetchDoctorData', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    it("should fetch doctors' schedules and manage bookings correctly", async () => {
      mockFetch([
        {
          name: 'Dr. Smith',
          timezone: 'UTC',
          day_of_week: 'Monday',
          available_at: '9:00AM',
          available_until: '11:00AM',
        },
        {
          name: 'Dr. Jones',
          timezone: 'UTC',
          day_of_week: 'Tuesday',
          available_at: '10:00AM',
          available_until: '12:00PM',
        },
      ]);

      const data = await fetchDoctorData();
      expect(data).toHaveLength(2);
    });

    it('should handle invalid data entries gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFetch([
        {
          name: 'Dr. Smith',
          timezone: 'UTC',
          day_of_week: 'Monday',
          available_at: '9:00AM',
          available_until: '11:00AM',
        },
        {
          name: 'Dr. Invalid',
          timezone: 'UTC',
          day_of_week: undefined,
          available_at: '10:00AM',
          available_until: '12:00PM',
        },
        {
          name: 'Dr. Null',
          timezone: null,
          day_of_week: 'Wednesday',
          available_at: '10:00AM',
          available_until: '12:00PM',
        },
      ]);

      const data = await fetchDoctorData();
      expect(data).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid entry found and skipped:',
        expect.objectContaining({ name: 'Dr. Invalid' }),
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('timeslot generation', () => {
    it("should generate correct timeslots for a doctor's schedule", async () => {
      const timeslots = generateTimeslot('Monday', '9:00AM', '11:00AM');
      expect(timeslots).toEqual([
        { timeStart: '9:00AM', timeEnd: '9:30AM' },
        { timeStart: '9:30AM', timeEnd: '10:00AM' },
        { timeStart: '10:00AM', timeEnd: '10:30AM' },
        { timeStart: '10:30AM', timeEnd: '11:00AM' },
      ]);
    });

    it('should return empty array if available_at is after available_until', async () => {
      const timeslots = generateTimeslot('Monday', '11:00AM', '9:00AM');
      expect(timeslots).toEqual([]);
    });

    it('should handle edge case where available_at equals available_until', async () => {
      const timeslots = generateTimeslot('Monday', '10:00AM', '10:00AM');
      expect(timeslots).toEqual([]);
    });

    it('should handle invalid time formats gracefully', async () => {
      const timeslots = generateTimeslot('Monday', 'invalidTime', '11:00AM');
      expect(timeslots).toEqual([]);
    });
  });

  describe('useDoctorsSchedule hook', () => {
    const mockedData = [
      {
        name: 'Dr. Smith',
        timezone: 'UTC',
        day_of_week: 'Monday',
        available_at: '9:00AM',
        available_until: '11:00AM',
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      (localStorage as jest.Mock).mockReturnValue({
        getItem: jest.fn(async () => ({})),
        setItem: jest.fn(async () => undefined),
      });
    });

    const renderWithProviderhook = () => {
      mockFetch(mockedData);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      return renderHook(() => useDoctorsSchedule(), { wrapper });
    };

    it('initializes and loads schedule data', async () => {
      const { result } = renderWithProviderhook();

      await waitFor(() => {
        expect(result.current.doctorSchedules.data?.length ?? 0).toEqual(1);
      });
    });

    it('allows booking a timeslot', async () => {
      const mockedSetItem = jest.fn(async () => undefined);
      const mockedGetItem = jest.fn(async () => null);
      (localStorage as jest.Mock).mockReturnValue({
        getItem: mockedGetItem,
        setItem: mockedSetItem,
      });

      const { result } = renderWithProviderhook();

      const doctorName = 'Dr. Smith';
      const dayOfWeek = 'Monday';
      const timeslot = { timeStart: '9:00AM', timeEnd: '9:30AM' };

      act(() => {
        result.current.bookSchedule({ doctorName, dayOfWeek, timeslot });
      });

      await waitFor(() => {
        expect(mockedSetItem).toHaveBeenCalledWith({
          [doctorName]: [{ doctorName, dayOfWeek, timeslot }],
        });
      });
    });

    it('should allow cancelling a booked timeslot', async () => {
      const mockedSetItem = jest.fn(async () => undefined);
      const mockedGetItem = jest.fn(async () => ({
        'Dr. Smith': [
          {
            doctorName: 'Dr. Smith',
            dayOfWeek: 'Monday',
            timeslot: { timeStart: '9:00AM', timeEnd: '9:30AM' },
          },
        ],
      }));
      (localStorage as jest.Mock).mockReturnValue({
        getItem: mockedGetItem,
        setItem: mockedSetItem,
      });
      const { result } = renderWithProviderhook();
      const doctorName = 'Dr. Smith';
      const dayOfWeek = 'Monday';
      const timeslot = { timeStart: '9:00AM', timeEnd: '9:30AM' };
      
      act(() => {
        result.current.cancelSchedule({ doctorName, dayOfWeek, timeslot });
      });

      await waitFor(() => {
        expect(mockedSetItem).toHaveBeenCalledWith({});
      });
    });
  });
});
