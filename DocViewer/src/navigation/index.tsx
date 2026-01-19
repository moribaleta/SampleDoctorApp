import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Appointments } from './screens/Appointments';
import { Home } from './screens/Home';
import { NotFound } from './screens/NotFound';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/IconSymbol';
import TabBarBackground from '@/components/TabBarBackground';
import { ScheduleModal } from './screens/ScheduleModal';

const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {
        headerShown: false,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
      },
    },
    Appointments: {
      screen: Appointments,
      options: {
        headerShown: false,
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
      },
    },
  },
  screenOptions: {
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    /* tabBarStyle: Platform.select({
      ios: {
        // Use a transparent background on iOS to show the blur effect
        position: 'absolute',
      },
      default: {},
    }), */
  },
});

const RootStack = createNativeStackNavigator({
  groups: {
    default: {
      screens: {
        HomeTabs: {
          screen: HomeTabs,
          options: {
            headerShown: false,
          },
        },
        NotFound: {
          screen: NotFound,
          options: {
            title: '404',
          },
          linking: {
            path: '*',
          },
        },
      },
    },
    Modal: {
      screenOptions: {
        presentation: 'formSheet',
        headerShown: true,
      },
      screens: {
        ScheduleModal: {
          screen: ScheduleModal,
          initialParams: {
            doctorName: undefined,
          },
        },
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

export type RootStackParamList = Omit<StaticParamList<typeof RootStack>, 'ScheduleModal'> & {
  ScheduleModal: {
    doctorName?: string;
  };
};

declare global {
  namespace ReactNavigation {
    type RootParamList = RootStackParamList;
  }
}
