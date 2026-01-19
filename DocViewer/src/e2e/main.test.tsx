import { App } from '@/App';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native/build/pure';
import { alert } from '@/components/Alert';

const mockData = [
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
  {
    name: 'Dr. Sara',
    timezone: 'UTC',
    day_of_week: 'Wednesday',
    available_at: '1:00PM',
    available_until: '3:00PM',
  },
];

jest.mock('@/components/Alert', () => ({
  alert: jest.fn((title: string, message?: string, buttons?: any[]) => {
    const confirmOption = buttons?.find(({ style }: { style?: string }) => style !== 'cancel');
    confirmOption?.onPress?.();
  }),
}));

describe('E2E Tests for DocViewer App', () => {
  const mockFetch = () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      }),
    ) as jest.Mock;
  };

  it('should run a basic test', async () => {
    mockFetch();
    const { getByText } = render(<App />);

    await waitFor(() => {
      mockData.forEach((doctor) => {
        expect(getByText(doctor.name)).toBeTruthy();
      });
    });

    act(() => {
      fireEvent.press(getByText('Dr. Smith'));
    });

    await waitFor(() => {
      expect(getByText('Select a schedule:')).toBeTruthy();
    });

    act(() => {
      fireEvent.press(getByText('Monday'));
    });

    await waitFor(() => {
      expect(getByText('9:00AM - 9:30AM')).toBeTruthy();
      expect(getByText('9:30AM - 10:00AM')).toBeTruthy();
      expect(getByText('10:00AM - 10:30AM')).toBeTruthy();
      expect(getByText('10:30AM - 11:00AM')).toBeTruthy();
    });

    act(() => {
      fireEvent.press(getByText('9:00AM - 9:30AM'));
    });

    expect(alert).toHaveBeenCalledWith(
      'Confirm Booking',
      'Do you want to book this schedule?\n\nMonday, 9:00AM - 9:30AM',
      expect.any(Array),
    );

    await waitFor(() => {
      expect(getByText('Available Doctors')).toBeTruthy();
    });

    act(() => {
      fireEvent.press(getByText('Appointments'));
    });

    await waitFor(() => {
      expect(getByText('Scheduled Appointments')).toBeTruthy();
      expect(getByText('Dr. Smith')).toBeTruthy();
      expect(getByText('Monday: 9:00AM - 9:30AM')).toBeTruthy();
    });
  });
});
