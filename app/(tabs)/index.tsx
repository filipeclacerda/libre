import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useUserStore } from '@/src/store/userStore';
import { useAchievementsStore } from '@/src/store/achievementsStore';
import { useDiaryStore } from '@/src/store/diaryStore';
import { ACHIEVEMENTS, getTranslatedAchievements } from '@/src/lib/achievements';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getQuitDateTime(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

function getElapsed(from: Date) {
  const ms = Math.max(0, Date.now() - from.getTime());
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

// ── Achievement proximity thresholds ─────────────────────────────────────────

type ACtx = { hoursSinceQuit: number; daysSinceQuit: number; cigarettesNotSmoked: number; moneySaved: number; cravingsWon: number; diaryEntries: number };

// ── Time milestones (mirrors achievement thresholds) ─────────────────────────

const TIME_STEP_HOURS: { hours: number; key: string }[] = [
  { hours: 12,    key: 'h12' },
  { hours: 24,    key: 'h24' },
  { hours: 48,    key: 'd2' },
  { hours: 72,    key: 'd3' },
  { hours: 168,   key: 'w1' },
  { hours: 360,   key: 'w2' },
  { hours: 720,   key: 'm1' },
  { hours: 1440,  key: 'm2' },
  { hours: 2160,  key: 'm3' },
  { hours: 4320,  key: 'm6' },
  { hours: 8760,  key: 'y1' },
  { hours: 17520, key: 'y2' },
  { hours: 43800, key: 'y5' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function CircularTimer({ displayValue, displayUnit, progress }: {
  displayValue: number;
  displayUnit: string;
  progress: number;
}) {
  const size = 120;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.card2} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={Colors.primary} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference * clamped} ${circumference}`}
          strokeLinecap="round" rotation="-90" origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.timerDays}>{displayValue}</Text>
      <Text style={styles.timerDaysLabel}>{displayUnit}</Text>
    </View>
  );
}

function MetricCard({ icon, iconBg, value, label }: { icon: string; iconBg: string; value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function AchievementCelebration({
  achievementId, onDismiss,
}: { achievementId: string; onDismiss: () => void }) {
  const { t } = useTranslation();
  const translatedAchievements = getTranslatedAchievements(t);
  const achievement = translatedAchievements.find(a => a.id === achievementId);
  if (!achievement) return null;

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={cel.overlay} onPress={onDismiss}>
        <View style={cel.card}>
          <Text style={cel.sparkle}>✨</Text>
          <Text style={cel.badgeIcon}>{achievement.icon}</Text>
          <Text style={cel.headline}>{t('home.achievementUnlocked')}</Text>
          <Text style={cel.title}>{achievement.title}</Text>
          <Text style={cel.desc}>{achievement.desc}</Text>
          <TouchableOpacity style={cel.btn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={cel.btnText}>{t('home.incredibleBtn')}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const profile = useUserStore(s => s.profile);
  const relapses = useUserStore(s => s.relapses);
  const entries = useDiaryStore(s => s.entries);
  const { checkAndUnlock, pendingCelebration, dismissCelebration, unlocked } = useAchievementsStore();

  // Streak is calculated from streakStart (resets on relapse) or quitDate
  const streakDateStr = profile?.streakStart ?? profile?.quitDate ?? new Date().toISOString().split('T')[0];
  const quitDateStr   = profile?.quitDate ?? new Date().toISOString().split('T')[0];

  const streakDate = getQuitDateTime(streakDateStr);
  const quitDate   = getQuitDateTime(quitDateStr);

  const [elapsed, setElapsed] = useState(() => getElapsed(streakDate));

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(streakDate)), 1000);
    return () => clearInterval(id);
  }, [streakDate]);

  const { days, hours, minutes, seconds, totalSeconds } = elapsed;

  // Metrics calculated from ORIGINAL quit date (full journey)
  const cigarettesPerDay  = profile?.cigarettesPerDay ?? 15;
  const pricePerPack      = profile?.pricePerPack ?? 12.5;
  const cigarettesPerPack = profile?.cigarettesPerPack ?? 20;

  const totalSecondsFromQuit = Math.floor(Math.max(0, Date.now() - quitDate.getTime()) / 1000);
  const cigarettesNotSmoked  = Math.floor((totalSecondsFromQuit / 86400) * cigarettesPerDay);
  const relapsesCigs         = relapses.reduce((sum, r) => sum + r.cigarettes, 0);
  const diaryCigs            = entries.filter(e => !e.resisted).reduce((sum, e) => sum + (e.cigarettesSmoked ?? 0), 0);
  const netCigsNotSmoked     = Math.max(0, cigarettesNotSmoked - relapsesCigs - diaryCigs);
  const moneySaved           = Math.round((netCigsNotSmoked / cigarettesPerPack) * pricePerPack);
  const lifeRegainedDays     = Math.floor((netCigsNotSmoked * 11) / 1440);
  const tarAvoidedG          = ((netCigsNotSmoked * 47) / 1000).toFixed(1);
  const hoursSinceQuit       = Math.floor(totalSecondsFromQuit / 3600);
  const daysSinceQuit        = Math.floor(totalSecondsFromQuit / 86400);

  // Ring progress: fill towards the next time milestone
  const nextTimeStep    = TIME_STEP_HOURS.find(s => hoursSinceQuit < s.hours);
  const prevTimeHours   = nextTimeStep
    ? (TIME_STEP_HOURS[TIME_STEP_HOURS.indexOf(nextTimeStep) - 1]?.hours ?? 0)
    : TIME_STEP_HOURS[TIME_STEP_HOURS.length - 1].hours;
  const ringProgress    = nextTimeStep
    ? (hoursSinceQuit - prevTimeHours) / (nextTimeStep.hours - prevTimeHours)
    : 1;
  // Show hours inside the circle during the first day; days after that
  const circleValue     = hoursSinceQuit < 24 ? hoursSinceQuit : days;
  const circleUnit      = hoursSinceQuit < 24 ? t('home.hours') : t('home.days');

  // ── Card: próxima conquista ──────────────────────────────────────────────────
  const cravingsWon = entries.filter(e => e.resisted).length;
  const achievCtx: ACtx = { hoursSinceQuit, daysSinceQuit, cigarettesNotSmoked: netCigsNotSmoked, moneySaved, cravingsWon, diaryEntries: entries.length };

  const ACHIEV_THRESHOLDS: Array<{
    id: string;
    get: (c: ACtx) => number;
    target: number;
    fmtLeft: (n: number) => string;
  }> = [
    { id: 'h12',     get: c => c.hoursSinceQuit,      target: 12,    fmtLeft: n => t('home.timeLeft_hours', { count: n }) },
    { id: 'h24',     get: c => c.hoursSinceQuit,      target: 24,    fmtLeft: n => t('home.timeLeft_hours', { count: n }) },
    { id: 'd2',      get: c => c.daysSinceQuit,       target: 2,     fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'd3',      get: c => c.daysSinceQuit,       target: 3,     fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'w1',      get: c => c.daysSinceQuit,       target: 7,     fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'w2',      get: c => c.daysSinceQuit,       target: 15,    fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'm1',      get: c => c.daysSinceQuit,       target: 30,    fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'm2',      get: c => c.daysSinceQuit,       target: 60,    fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'm3',      get: c => c.daysSinceQuit,       target: 90,    fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'm6',      get: c => c.daysSinceQuit,       target: 180,   fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'y1',      get: c => c.daysSinceQuit,       target: 365,   fmtLeft: n => t('home.timeLeft_days', { count: n }) },
    { id: 'cig10',   get: c => c.cigarettesNotSmoked, target: 10,    fmtLeft: n => t('home.timeLeft_cigarettes', { count: n }) },
    { id: 'cig50',   get: c => c.cigarettesNotSmoked, target: 50,    fmtLeft: n => t('home.timeLeft_cigarettes', { count: n }) },
    { id: 'cig100',  get: c => c.cigarettesNotSmoked, target: 100,   fmtLeft: n => t('home.timeLeft_cigarettes', { count: n }) },
    { id: 'cig200',  get: c => c.cigarettesNotSmoked, target: 200,   fmtLeft: n => t('home.timeLeft_cigarettes', { count: n }) },
    { id: 'cig500',  get: c => c.cigarettesNotSmoked, target: 500,   fmtLeft: n => t('home.timeLeft_cigarettes', { count: n }) },
    { id: 'cig1000', get: c => c.cigarettesNotSmoked, target: 1000,  fmtLeft: n => t('home.timeLeft_cigarettes', { count: n }) },
    { id: 'r20',     get: c => c.moneySaved,          target: 20,    fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'r50',     get: c => c.moneySaved,          target: 50,    fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'r100',    get: c => c.moneySaved,          target: 100,   fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'r200',    get: c => c.moneySaved,          target: 200,   fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'r500',    get: c => c.moneySaved,          target: 500,   fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'r1000',   get: c => c.moneySaved,          target: 1000,  fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'r2000',   get: c => c.moneySaved,          target: 2000,  fmtLeft: n => t('home.timeLeft_money', { amount: n }) },
    { id: 'res1',    get: c => c.cravingsWon,         target: 1,     fmtLeft: n => t('home.timeLeft_cravings', { count: n }) },
    { id: 'res5',    get: c => c.cravingsWon,         target: 5,     fmtLeft: n => t('home.timeLeft_cravings', { count: n }) },
    { id: 'res10',   get: c => c.cravingsWon,         target: 10,    fmtLeft: n => t('home.timeLeft_cravings', { count: n }) },
    { id: 'res25',   get: c => c.cravingsWon,         target: 25,    fmtLeft: n => t('home.timeLeft_cravings', { count: n }) },
    { id: 'res50',   get: c => c.cravingsWon,         target: 50,    fmtLeft: n => t('home.timeLeft_cravings', { count: n }) },
    { id: 'res100',  get: c => c.cravingsWon,         target: 100,   fmtLeft: n => t('home.timeLeft_cravings', { count: n }) },
    { id: 'diary1',  get: c => c.diaryEntries,        target: 1,     fmtLeft: n => t('home.timeLeft_entries', { count: n }) },
    { id: 'diary5',  get: c => c.diaryEntries,        target: 5,     fmtLeft: n => t('home.timeLeft_entries', { count: n }) },
    { id: 'diary10', get: c => c.diaryEntries,        target: 10,    fmtLeft: n => t('home.timeLeft_entries', { count: n }) },
    { id: 'diary20', get: c => c.diaryEntries,        target: 20,    fmtLeft: n => t('home.timeLeft_entries', { count: n }) },
    { id: 'diary50', get: c => c.diaryEntries,        target: 50,    fmtLeft: n => t('home.timeLeft_entries', { count: n }) },
  ];

  const translatedAchievements = getTranslatedAchievements(t);

  const nextAchiev = (() => {
    const best = ACHIEV_THRESHOLDS
      .filter(th => !unlocked[th.id] && th.get(achievCtx) < th.target)
      .map(th => ({ th, progress: th.get(achievCtx) / th.target }))
      .sort((a, b) => b.progress - a.progress)[0];
    if (!best) return null;
    const achievement = translatedAchievements.find(a => a.id === best.th.id)!;
    const current = best.th.get(achievCtx);
    const remaining = best.th.target - current;
    return { achievement, progress: best.progress, label: best.th.fmtLeft(remaining), current, target: best.th.target };
  })();

  // ── Card: frase do dia ────────────────────────────────────────────────────────
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quotes = t('quotes', { returnObjects: true }) as string[];
  const dailyQuote = quotes[dayOfYear % quotes.length];

  // ── Card: resumo semanal ──────────────────────────────────────────────────────
  const weekCutoff = new Date(); weekCutoff.setDate(weekCutoff.getDate() - 7);
  const weekEntries = entries.filter(e => new Date(e.timestamp) >= weekCutoff);
  const weekResisted = weekEntries.filter(e => e.resisted).length;
  const weekResistRate = weekEntries.length > 0 ? Math.round((weekResisted / weekEntries.length) * 100) : 0;
  const weekTopTrigger = (() => {
    if (weekEntries.length === 0) return null;
    const counts: Record<string, number> = {};
    weekEntries.forEach(e => { counts[e.trigger] = (counts[e.trigger] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  // Check achievements
  useEffect(() => {
    checkAndUnlock({
      hoursSinceQuit,
      daysSinceQuit,
      cigarettesNotSmoked: netCigsNotSmoked,
      moneySaved,
      cravingsWon,
      diaryEntries: entries.length,
    });
  }, [hoursSinceQuit, daysSinceQuit, netCigsNotSmoked, moneySaved, cravingsWon, entries.length]);

  const firstName = (profile?.name ?? 'você').split(' ')[0];
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';
  const today = new Date();
  const header = `${today.toLocaleDateString(locale, { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase())} · ${today.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Achievement celebration overlay */}
      {pendingCelebration.length > 0 && (
        <AchievementCelebration
          achievementId={pendingCelebration[0]}
          onDismiss={dismissCelebration}
        />
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{header}</Text>
            <Text style={styles.headerGreeting}>{t('home.greeting', { name: firstName })}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7} onPress={() => router.push('/relapse')}>
            <Text style={styles.bellIcon}>⚠️</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={['#1A2A22', '#1C1C2E']} style={styles.timerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.timerCardTop}>
            <Text style={styles.timerCardLabel}>{t('home.smokeFree')}</Text>
            <View style={styles.sequenceBadge}>
              <Text style={styles.sequenceBadgeText}>{t('home.streakActive')}</Text>
            </View>
          </View>
          <View style={styles.timerCardBody}>
            <CircularTimer displayValue={circleValue} displayUnit={circleUnit} progress={ringProgress} />
            <View style={styles.timerDetails}>
              <View style={styles.timerDetailRow}>
                <Text style={styles.timerDetailNum}>{hours}</Text>
                <Text style={styles.timerDetailUnit}>{t('home.hours')}</Text>
              </View>
              <View style={styles.timerDetailRow}>
                <Text style={styles.timerDetailNum}>{minutes}</Text>
                <Text style={styles.timerDetailUnit}>{t('home.minutes')}</Text>
              </View>
              <View style={styles.timerDetailRow}>
                <Text style={styles.timerDetailNum}>{seconds}</Text>
                <Text style={styles.timerDetailUnit}>{t('home.seconds')}</Text>
              </View>
              {nextTimeStep && (
                <View style={styles.nextMilestoneChip}>
                  <Text style={styles.nextMilestoneText}>→ {t(`home.timeSteps.${nextTimeStep.key}`)}</Text>
                </View>
              )}
              {relapses.length > 0 && (
                <View style={[styles.nextMilestoneChip, { backgroundColor: Colors.red + '22' }]}>
                  <Text style={[styles.nextMilestoneText, { color: Colors.red + 'CC' }]}>
                    {t('home.relapses', { count: relapses.length })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.metricsGrid}>
          <MetricCard icon="✕" iconBg={Colors.red + 'CC'} value={netCigsNotSmoked.toLocaleString(locale)} label={t('home.cigsNotSmoked')} />
          <MetricCard icon="✦" iconBg={Colors.primary} value={`R$ ${moneySaved.toLocaleString(locale)}`} label={t('home.saved')} />
          <MetricCard icon="♥" iconBg={Colors.secondary} value={lifeRegainedDays > 0 ? `${lifeRegainedDays}d` : '< 1d'} label={t('home.lifeRegained')} />
          <MetricCard icon="◎" iconBg={Colors.secondary + 'BB'} value={`${tarAvoidedG}g`} label={t('home.tarAvoided')} />
        </View>

        {/* Next achievement */}
        {nextAchiev && (
          <View style={styles.nextAchievCard}>
            <Text style={styles.cardSectionLabel}>{t('home.nextAchievement')}</Text>
            <View style={styles.nextAchievRow}>
              <Text style={styles.nextAchievIcon}>{nextAchiev.achievement.icon}</Text>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.nextAchievTitleRow}>
                  <Text style={styles.nextAchievTitle}>{nextAchiev.achievement.title}</Text>
                  <Text style={styles.nextAchievPct}>{Math.round(nextAchiev.progress * 100)}%</Text>
                </View>
                <Text style={styles.nextAchievDesc}>{nextAchiev.achievement.desc}</Text>
                <View style={styles.nextAchievBarBg}>
                  <View style={[styles.nextAchievBarFill, { width: `${Math.round(nextAchiev.progress * 100)}%` as any }]} />
                </View>
                <Text style={styles.nextAchievLeft}>{t('home.remaining', { label: nextAchiev.label })}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Daily quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={styles.quoteText}>{dailyQuote}</Text>
        </View>

        {/* Weekly summary */}
        {weekEntries.length > 0 && (
          <View style={styles.weekCard}>
            <Text style={styles.cardSectionLabel}>{t('home.thisWeek')}</Text>
            <View style={styles.weekRow}>
              <View style={styles.weekItem}>
                <Text style={styles.weekValue}>{weekEntries.length}</Text>
                <Text style={styles.weekLabel}>{t('home.cravingsRegistered')}</Text>
              </View>
              <View style={styles.weekDivider} />
              <View style={styles.weekItem}>
                <Text style={[styles.weekValue, { color: Colors.primary }]}>{weekResistRate}%</Text>
                <Text style={styles.weekLabel}>{t('home.resistanceRate')}</Text>
              </View>
              {weekTopTrigger && <>
                <View style={styles.weekDivider} />
                <View style={styles.weekItem}>
                  <Text style={styles.weekTrigger}>{weekTopTrigger}</Text>
                  <Text style={styles.weekLabel}>{t('home.mostCommonTrigger')}</Text>
                </View>
              </>}
            </View>
          </View>
        )}

        {/* Health milestones shortcut */}
        <TouchableOpacity style={styles.milestoneCard} onPress={() => router.push('/(tabs)/health')} activeOpacity={0.8}>
          <View style={[styles.milestoneIcon, { backgroundColor: Colors.secondary + '33' }]}>
            <Text style={styles.milestoneIconText}>♥</Text>
          </View>
          <View style={styles.milestoneText}>
            <Text style={styles.milestoneLabel}>{t('home.healthMilestones')}</Text>
            <Text style={styles.milestoneTitle}>{t('home.viewHealthProgress')}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.sosBanner} onPress={() => router.push('/sos')} activeOpacity={0.85}>
        <Text style={styles.sosBannerText}>{t('home.sosButton')}</Text>
        <Text style={styles.sosBannerArrow}>›</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 90, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 12 },
  headerDate: { fontSize: 13, color: Colors.muted },
  headerGreeting: { fontSize: 24, fontWeight: '800', color: Colors.white, marginTop: 2, letterSpacing: -0.3 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  bellIcon: { fontSize: 16 },
  timerCard: { borderRadius: 20, padding: 20, gap: 12 },
  timerCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerCardLabel: { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  sequenceBadge: { backgroundColor: Colors.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sequenceBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  timerCardBody: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  timerDays: { fontSize: 38, fontWeight: '800', color: Colors.white },
  timerDaysLabel: { fontSize: 12, color: Colors.muted, marginTop: -4 },
  timerDetails: { flex: 1, gap: 4 },
  timerDetailRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  timerDetailNum: { fontSize: 20, fontWeight: '700', color: Colors.white },
  timerDetailUnit: { fontSize: 12, color: Colors.muted },
  nextMilestoneChip: { marginTop: 4, backgroundColor: Colors.card2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  nextMilestoneText: { fontSize: 11, color: Colors.muted },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '47.5%', backgroundColor: Colors.card, borderRadius: 18, padding: 16, gap: 8 },
  metricIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricIconText: { fontSize: 16, color: Colors.white },
  metricValue: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  metricLabel: { fontSize: 12, color: Colors.muted, lineHeight: 16 },
  cardSectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 1 },
  nextAchievCard: { backgroundColor: Colors.card, borderRadius: 18, padding: 16, gap: 12 },
  nextAchievRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nextAchievIcon: { fontSize: 38 },
  nextAchievTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextAchievTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  nextAchievPct: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  nextAchievDesc: { fontSize: 12, color: Colors.muted },
  nextAchievBarBg: { height: 4, backgroundColor: Colors.card2, borderRadius: 4 },
  nextAchievBarFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 4 },
  nextAchievLeft: { fontSize: 11, color: Colors.muted },
  quoteCard: { backgroundColor: Colors.card, borderRadius: 18, paddingHorizontal: 20, paddingVertical: 18, gap: 6 },
  quoteIcon: { fontSize: 28, color: Colors.primary + '88', lineHeight: 28, fontWeight: '800' },
  quoteText: { fontSize: 14, color: Colors.white, lineHeight: 22, fontStyle: 'italic' },
  weekCard: { backgroundColor: Colors.card, borderRadius: 18, padding: 16, gap: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  weekItem: { alignItems: 'center', gap: 4, flex: 1 },
  weekValue: { fontSize: 24, fontWeight: '800', color: Colors.white },
  weekLabel: { fontSize: 11, color: Colors.muted, textAlign: 'center', lineHeight: 15 },
  weekTrigger: { fontSize: 13, fontWeight: '700', color: Colors.amber },
  weekDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  milestoneCard: { backgroundColor: Colors.card, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  milestoneIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  milestoneIconText: { fontSize: 20 },
  milestoneText: { flex: 1 },
  milestoneLabel: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.8 },
  milestoneTitle: { fontSize: 14, fontWeight: '600', color: Colors.white, marginTop: 2, lineHeight: 20 },
  sosBanner: {
    position: 'absolute', bottom: 10, left: 20, right: 20,
    backgroundColor: '#F97316', borderRadius: 18,
    paddingHorizontal: 20, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  sosBannerText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  sosBannerArrow: { fontSize: 24, color: Colors.white },
});

const cel = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  card: {
    backgroundColor: Colors.card, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 10, width: '100%',
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  sparkle: { fontSize: 28, position: 'absolute', top: 20, right: 24 },
  badgeIcon: { fontSize: 56 },
  headline: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  desc: { fontSize: 14, color: Colors.muted, textAlign: 'center' },
  btn: {
    marginTop: 8, backgroundColor: Colors.primary,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32,
  },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
