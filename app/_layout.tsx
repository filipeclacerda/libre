import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { initI18n } from '@/src/i18n';
import { useLanguageStore } from '@/src/store/languageStore';

// How to handle notifications when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const language = useLanguageStore(s => s.language);

  // Initialize i18n with the manually selected language (or device locale)
  initI18n(language);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    // Create a notification channel for Android
    Notifications.setNotificationChannelAsync('default', {
      name: 'Libre',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sos" options={{ presentation: 'modal' }} />
        <Stack.Screen name="relapse" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
