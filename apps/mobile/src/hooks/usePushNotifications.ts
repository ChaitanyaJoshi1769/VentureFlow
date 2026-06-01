import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import ApiService from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      // Register device with backend
      const deviceType = Device.osName === 'iOS' ? 'ios' : 'android';
      await ApiService.registerPushDevice(token, deviceType);
    } catch (error) {
      console.error('Push notification registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { expoPushToken, isLoading };
}
