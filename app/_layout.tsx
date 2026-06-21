import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { initI18n } from '@/src/i18n';
import { useLanguageStore } from '@/src/store/languageStore';
import { useUserStore } from '@/src/store/userStore';
import { useDiaryStore } from '@/src/store/diaryStore';
import {
  getPermissionStatus,
  syncNotifications,
  setupNotificationHandler,
  setupAndroidChannel,
} from '@/src/lib/notifications';

export default function RootLayout() {
  const language = useLanguageStore(s => s.language);
  const profile = useUserStore(s => s.profile);
  const entries = useDiaryStore(s => s.entries);
  const hasHydrated = useUserStore(s => s._hasHydrated);

  // Initialize i18n with the manually selected language (or device locale)
  initI18n(language);

  useEffect(() => {
    // Configure foreground handling + Android channel (no-ops on web / Expo Go Android)
    setupNotificationHandler();
    setupAndroidChannel();
  }, []);

  // Re-sync notifications for returning users who already granted permission
  useEffect(() => {
    if (Platform.OS === 'web' || !hasHydrated || !profile) return;
    getPermissionStatus().then(granted => { if (granted) syncNotifications(profile, entries); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, profile?.quitDate, profile?.streakStart, entries.length]);

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
