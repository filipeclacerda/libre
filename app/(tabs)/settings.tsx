import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useUserStore } from '@/src/store/userStore';
import { useAchievementsStore } from '@/src/store/achievementsStore';
import { ACHIEVEMENTS, getTranslatedAchievements } from '@/src/lib/achievements';
import { useLanguageStore, SupportedLanguage } from '@/src/store/languageStore';
import i18n from '@/src/i18n';
import {
  requestPermissions, getPermissionStatus,
  scheduleDailyMotivational, cancelAll,
} from '@/src/lib/notifications';

function formatQuitDate(str: string, locale: string) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function AchievementBadge({ id, unlockDate }: { id: string; unlockDate?: string }) {
  const { t } = useTranslation();
  const translatedAchievements = getTranslatedAchievements(t);
  const achievement = translatedAchievements.find(a => a.id === id);
  if (!achievement) return null;
  const unlocked = !!unlockDate;

  return (
    <View style={[styles.badge, !unlocked && styles.badgeLocked]}>
      <Text style={[styles.badgeIcon, !unlocked && styles.badgeIconLocked]}>
        {unlocked ? achievement.icon : '🔒'}
      </Text>
      <Text style={[styles.badgeTitle, !unlocked && styles.badgeTitleLocked]} numberOfLines={2}>
        {achievement.title}
      </Text>
    </View>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const profile = useUserStore(s => s.profile);
  const clearProfile = useUserStore(s => s.clearProfile);
  const { unlocked } = useAchievementsStore();
  const [notificationsOn, setNotificationsOn] = useState(false);
  const { language, setLanguage } = useLanguageStore();

  const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';

  useEffect(() => {
    getPermissionStatus().then(setNotificationsOn);
  }, []);

  async function handleNotificationToggle(value: boolean) {
    if (value) {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleDailyMotivational(9, 0);
        setNotificationsOn(true);
      }
    } else {
      await cancelAll();
      setNotificationsOn(false);
    }
  }

  function handleLanguageSelect(lang: SupportedLanguage) {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  }

  function handleLogout() {
    Alert.alert(
      t('settings.logoutTitle'),
      t('settings.logoutMessage'),
      [
        { text: t('settings.logoutCancel'), style: 'cancel' },
        {
          text: t('settings.logoutConfirm'),
          style: 'destructive',
          onPress: () => {
            clearProfile();
            router.replace('/(onboarding)/welcome');
          },
        },
      ]
    );
  }

  const initial = profile?.name?.charAt(0)?.toUpperCase() ?? '?';
  const unlockedCount = Object.keys(unlocked).length;

  const categories: { labelKey: string; key: 'time' | 'savings' | 'diary' }[] = [
    { labelKey: 'TEMPO', key: 'time' },
    { labelKey: 'ECONOMIA', key: 'savings' },
    { labelKey: 'DIÁRIO', key: 'diary' },
  ];

  const currentLang = (language ?? i18n.language ?? 'pt') as SupportedLanguage;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        {profile && (
          <>
            {/* Avatar + name */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </View>
            </View>

            {/* Quit info */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('settings.journey')}</Text>
              <View style={styles.card}>
                <InfoRow label={t('settings.quitDate')} value={formatQuitDate(profile.quitDate, locale)} />
              </View>
            </View>

            {/* Consumption */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('settings.consumption')}</Text>
              <View style={styles.card}>
                <InfoRow
                  label={t('settings.cigsPerDay')}
                  value={t('settings.cigsPerDayValue', { count: profile.cigarettesPerDay })}
                />
                <View style={styles.divider} />
                <InfoRow
                  label={t('settings.pricePerPack')}
                  value={t('settings.pricePerPackValue', { price: profile.pricePerPack.toFixed(2).replace('.', ',') })}
                />
                <View style={styles.divider} />
                <InfoRow
                  label={t('settings.cigsPerPack')}
                  value={t('settings.cigsPerPackValue', { count: profile.cigarettesPerPack })}
                />
              </View>
            </View>
          </>
        )}

        {/* Language switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={[styles.card, styles.langCard]}>
            <TouchableOpacity
              style={[styles.langBtn, currentLang === 'pt' && styles.langBtnActive]}
              onPress={() => handleLanguageSelect('pt')}
              activeOpacity={0.7}
            >
              <Text style={[styles.langBtnText, currentLang === 'pt' && styles.langBtnTextActive]}>PT</Text>
            </TouchableOpacity>
            <View style={styles.langDivider} />
            <TouchableOpacity
              style={[styles.langBtn, currentLang === 'en' && styles.langBtnActive]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.7}
            >
              <Text style={[styles.langBtnText, currentLang === 'en' && styles.langBtnTextActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{t('settings.dailyMotivation')}</Text>
                <Text style={[styles.infoLabel, { fontSize: 11, marginTop: 2 }]}>{t('settings.dailyAt')}</Text>
              </View>
              <Switch
                value={notificationsOn}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: Colors.border, true: Colors.primary + '88' }}
                thumbColor={notificationsOn ? Colors.primary : Colors.muted}
              />
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>{t('settings.achievements')}</Text>
            <Text style={styles.sectionCount}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
          </View>

          {categories.map(cat => {
            const items = ACHIEVEMENTS.filter(a => a.category === cat.key);
            return (
              <View key={cat.key} style={styles.achievementGroup}>
                <Text style={styles.achievementCatLabel}>
                  {t(`settings.achievementCategories.${cat.labelKey}`)}
                </Text>
                <View style={styles.badgeGrid}>
                  {items.map(a => (
                    <AchievementBadge key={a.id} id={a.id} unlockDate={unlocked[a.id]} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const BADGE_W = 72;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },

  profileCard: {
    backgroundColor: Colors.card, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary + '33',
    borderWidth: 2, borderColor: Colors.primary + '66',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  profileInfo: { gap: 3 },
  profileName: { fontSize: 17, fontWeight: '700', color: Colors.white },
  profileEmail: { fontSize: 13, color: Colors.muted },

  section: { gap: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 1 },
  sectionCount: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  card: { backgroundColor: Colors.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 14, color: Colors.muted },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.white },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: -16 },

  // Language switcher
  langCard: {
    flexDirection: 'row', paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden',
  },
  langBtn: {
    flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  langBtnActive: { backgroundColor: Colors.primary + '22' },
  langBtnText: { fontSize: 14, fontWeight: '600', color: Colors.muted },
  langBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  langDivider: { width: 1, backgroundColor: Colors.border },

  // Achievements
  achievementGroup: { gap: 8 },
  achievementCatLabel: { fontSize: 11, color: Colors.muted, fontWeight: '600', letterSpacing: 0.5 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: BADGE_W, alignItems: 'center', gap: 4,
    backgroundColor: Colors.card, borderRadius: 14, padding: 10,
    borderWidth: 1.5, borderColor: Colors.primary + '44',
  },
  badgeLocked: { borderColor: Colors.border, backgroundColor: Colors.card2, opacity: 0.5 },
  badgeIcon: { fontSize: 26 },
  badgeIconLocked: { opacity: 0.4 },
  badgeTitle: { fontSize: 10, color: Colors.white, fontWeight: '600', textAlign: 'center', lineHeight: 13 },
  badgeTitleLocked: { color: Colors.muted },

  logoutBtn: {
    marginTop: 8,
    backgroundColor: Colors.red + '18', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.red + '44',
  },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: Colors.red },
});
