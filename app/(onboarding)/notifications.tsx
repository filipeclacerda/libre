import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { useUserStore } from '@/src/store/userStore';
import { useDiaryStore } from '@/src/store/diaryStore';
import { requestPermissions, syncNotifications } from '@/src/lib/notifications';

export default function NotificationsOptIn() {
  const { t } = useTranslation();
  const profile = useUserStore(s => s.profile);
  const entries = useDiaryStore(s => s.entries);
  const [loading, setLoading] = useState(false);

  async function handleEnable() {
    setLoading(true);
    const granted = await requestPermissions();
    if (granted && profile) await syncNotifications(profile, entries);
    setLoading(false);
    router.replace('/(tabs)');
  }

  function handleSkip() {
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader step={5} total={5} onBack={() => router.back()} onSkip={handleSkip} />
      <View style={styles.content}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>{t('onboarding.notifications.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.notifications.subtitle')}</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleEnable} disabled={loading} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>{t('onboarding.notifications.enableBtn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>{t('onboarding.notifications.skipBtn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, alignItems: 'center', gap: 16 },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.white, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 20, gap: 8 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 10, alignItems: 'center' },
  skipBtnText: { fontSize: 14, fontWeight: '600', color: Colors.muted },
});
