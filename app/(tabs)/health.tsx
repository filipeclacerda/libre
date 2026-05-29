import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useUserStore } from '@/src/store/userStore';

// Fontes: American Cancer Society (ACS), NHS (UK), ASH (Action on Smoking and Health)
const MILESTONE_DEFS = [
  { id: '20min', thresholdMin: 20,      color: Colors.primary },
  { id: '8h',    thresholdMin: 480,     color: '#38BDF8' },
  { id: '12h',   thresholdMin: 720,     color: '#60A5FA' },
  { id: '24h',   thresholdMin: 1440,    color: '#4ADE80' },
  { id: '48h',   thresholdMin: 2880,    color: Colors.amber },
  { id: '3d',    thresholdMin: 4320,    color: '#F97316' },
  { id: '1w',    thresholdMin: 10080,   color: '#E879F9' },
  { id: '2w',    thresholdMin: 20160,   color: Colors.secondary },
  { id: '3w',    thresholdMin: 30240,   color: '#C084FC' },
  { id: '1m',    thresholdMin: 43200,   color: '#F472B6' },
  { id: '3m',    thresholdMin: 129600,  color: '#FB923C' },
  { id: '6m',    thresholdMin: 259200,  color: '#6EE7B7' },
  { id: '9m',    thresholdMin: 388800,  color: '#67E8F9' },
  { id: '1y',    thresholdMin: 525600,  color: '#A78BFA' },
  { id: '2y',    thresholdMin: 1051200, color: '#FBBF24' },
  { id: '5y',    thresholdMin: 2628000, color: '#34D399' },
  { id: '10y',   thresholdMin: 5256000, color: '#22D3EE' },
  { id: '15y',   thresholdMin: 7884000, color: '#FCD34D' },
  { id: '20y',   thresholdMin: 10512000, color: '#D946EF' },
];

const SOON_THRESHOLD_MIN = 3 * 24 * 60; // 3 days

function getQuitDateTime(quitDateStr: string): Date {
  const [y, m, d] = quitDateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

export default function Health() {
  const { t } = useTranslation();
  const profile = useUserStore(s => s.profile);
  const quitDate = getQuitDateTime(profile?.quitDate ?? new Date().toISOString().split('T')[0]);

  const elapsedMin = (Date.now() - quitDate.getTime()) / 60000;

  function formatTimeLeft(minutesLeft: number): string {
    if (minutesLeft < 60) return t('health.inMin', { n: Math.ceil(minutesLeft) });
    if (minutesLeft < 1440) return t('health.inHours', { n: Math.ceil(minutesLeft / 60) });
    return t('health.inDays', { n: Math.ceil(minutesLeft / 1440) });
  }

  const milestones = MILESTONE_DEFS.map(m => {
    const minutesLeft = m.thresholdMin - elapsedMin;
    let status: 'done' | 'soon' | 'locked';
    if (minutesLeft <= 0) status = 'done';
    else if (minutesLeft <= SOON_THRESHOLD_MIN) status = 'soon';
    else status = 'locked';
    return { ...m, status, minutesLeft };
  });

  const doneCount = milestones.filter(m => m.status === 'done').length;
  const progress = doneCount / milestones.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('health.title')}</Text>
        <Text style={styles.subtitle}>{t('health.subtitle', { done: doneCount, total: milestones.length })}</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressCardRow}>
            <Text style={styles.progressCardIcon}>◉</Text>
            <Text style={styles.progressCardLabel}>{t('health.overallProgress')}</Text>
            <Text style={styles.progressCardPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>

        <View style={styles.timeline}>
          {milestones.map((m, i) => {
            const isDone = m.status === 'done';
            const isSoon = m.status === 'soon';
            const isLocked = m.status === 'locked';
            const isLast = i === milestones.length - 1;
            const badgeLabel = isDone ? t('health.achieved') : isSoon ? formatTimeLeft(m.minutesLeft) : '';
            const badgeColor = isDone ? Colors.primary : Colors.amber;

            const milestoneTime = t(`health.milestones.${m.id}.time`);
            const milestoneDescription = t(`health.milestones.${m.id}.description`);

            return (
              <View key={m.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.milestoneIcon,
                    isDone  && { backgroundColor: m.color },
                    isSoon  && { backgroundColor: m.color + '33', borderWidth: 1.5, borderColor: m.color },
                    isLocked && { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border },
                  ]}>
                    {isDone  ? <Text style={styles.checkMark}>✓</Text>
                    : isSoon ? <Text style={[styles.soonDot, { color: m.color }]}>●</Text>
                    :          <Text style={styles.lockIcon}>🔒</Text>}
                  </View>
                  {!isLast && (
                    <View style={[styles.timelineLine, isDone && styles.timelineLineActive]} />
                  )}
                </View>

                <View style={[styles.milestoneCard, isLocked && styles.milestoneCardLocked]}>
                  <View style={styles.milestoneCardTop}>
                    <Text style={[styles.milestoneTime, isLocked && styles.milestoneTimeLocked]}>{milestoneTime}</Text>
                    {!isLocked && (
                      <View style={[styles.statusBadge, { backgroundColor: badgeColor + '22' }]}>
                        <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.milestoneDesc, isLocked && styles.milestoneDescLocked]}>
                    {milestoneDescription}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 16, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.muted, marginTop: -8 },
  progressCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, gap: 12 },
  progressCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressCardIcon: { fontSize: 18, color: Colors.primary },
  progressCardLabel: { flex: 1, fontSize: 14, color: Colors.muted, fontWeight: '500' },
  progressCardPct: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  progressBarBg: { height: 5, backgroundColor: Colors.card2, borderRadius: 4 },
  progressBarFill: { height: 5, backgroundColor: Colors.primary, borderRadius: 4 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 14, minHeight: 80 },
  timelineLeft: { alignItems: 'center', width: 42 },
  milestoneIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 18, color: Colors.white, fontWeight: '700' },
  soonDot: { fontSize: 20 },
  lockIcon: { fontSize: 16 },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 4 },
  timelineLineActive: { backgroundColor: Colors.primary + '66' },
  milestoneCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 4 },
  milestoneCardLocked: { opacity: 0.5 },
  milestoneCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  milestoneTime: { fontSize: 15, fontWeight: '700', color: Colors.white },
  milestoneTimeLocked: { color: Colors.muted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  milestoneDesc: { fontSize: 13, color: Colors.muted, lineHeight: 18 },
  milestoneDescLocked: { color: Colors.muted + 'AA' },
});
