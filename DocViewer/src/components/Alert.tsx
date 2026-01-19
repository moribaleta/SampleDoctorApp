import { Alert as ReactAlert, Platform } from 'react-native';

const alertWeb = (title: string, message?: string, buttons?: any[]) => {
  const confirmMessage = message ? `${title}\n\n${message}` : title;
  const result = window.confirm(confirmMessage);
  if (result) {
    const confirmOption = buttons?.find(({ style }) => style !== 'cancel');
    confirmOption && confirmOption.onPress();
  } else {
    const cancelOption = buttons?.find(({ style }) => style === 'cancel');
    cancelOption && cancelOption.onPress();
  }
};

export const alert = Platform.OS === 'web' ? alertWeb : ReactAlert.alert;
