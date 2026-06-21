import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useUserStore } from '@/src/store/userStore';
import { useDiaryStore } from '@/src/store/diaryStore';
import { parseQuitDate } from '@/src/lib/dateUtils';
import { formatCurrency, localeFor } from '@/src/lib/format';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_W = SCREEN_WIDTH - 80;
const CHART_H = 100;

const PERIODS: Record<string, number> = { '7d': 7, '30d': 30, '1a': 365 };

// Internal weekday order keys (Sun=0 .. Sat=6) — stored as locale-independent keys
const WEEKDAY_KEYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function buildSavingsPoints(
  quitDate: Date,
  days: number,
  cigarettesPerDay: number,
  pricePerPack: number,
  cigarettesPerPack: number
) {
  const costPerCig = pricePerPack / cigarettesPerPack;
  const savingsPerDay = cigarettesPerDay * costPerCig;
  const today = new Date();
  const points: { day: number; value: number }[] = [];

  for (let i = 1; i <= days; i++) {
    const d = new Date(quitDate);
    d.setDate(d.getDate() + i);
    if (d > today) break;
    points.push({ day: i, value: Math.round(savingsPerDay * i) });
  }
  return points;
}

function LineChart({ points, days, noDataLabel }: { points: { day: number; value: number }[]; days: number; noDataLabel: string }) {
  if (points.length < 2) {
    return (
      <View style={{ height: CHART_H + 24, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.muted, fontSize: 13 }}>{noDataLabel}</Text>
      </View>
    );
  }

  const maxVal = points[points.length - 1].value;
  const totalDays = days;

  const pts = points
    .map(p => {
      const x = (p.day / totalDays) * CHART_W;
      const y = CHART_H - (maxVal > 0 ? (p.value / maxVal) * CHART_H : 0);
      return `${x},${y}`;
    })
    .join(' ');

  const lastX = (points[points.length - 1].day / totalDays) * CHART_W;
  const lastY = CHART_H - (maxVal > 0 ? 1 : 0) * CHART_H;

  return (
    <View style={{ gap: 4 }}>
      <View style={{ height: CHART_H, position: 'relative', overflow: 'hidden' }}>
        <SvgLineChart pts={pts} lastX={lastX} lastY={lastY} />
      </View>
      <View style={styles.xAxis}>
        <Text style={styles.xLabel}>1</Text>
        <Text style={styles.xLabel}>{Math.round(days / 3)}</Text>
        <Text style={styles.xLabel}>{Math.round((days * 2) / 3)}</Text>
        <Text style={styles.xLabel}>{days}d</Text>
      </View>
    </View>
  );
}

function SvgLineChart({ pts, lastX, lastY }: { pts: string; lastX: number; lastY: number }) {
  try {
    const Svg = require('react-native-svg').default;
    const { Polyline, Circle: SvgCircle } = require('react-native-svg');

    return (
      <Svg width={CHART_W} height={CHART_H}>
        <Polyline points={pts} fill="none" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <SvgCircle cx={lastX} cy={lastY} r={5} fill={Colors.primary} />
      </Svg>
    );
  } catch {
    return null;
  }
}

function BarChart({ data }: { data: { day: string; value: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const maxIdx = data.reduce((mi, d, i, arr) => d.value > arr[mi].value ? i : mi, 0);

  return (
    <View style={styles.barChartWrap}>
      {data.map((d, i) => {
        const isMax = i === maxIdx && d.value > 0;
        const barH = Math.max((d.value / maxVal) * 80, d.value > 0 ? 6 : 2);
        return (
          <View key={d.day} style={styles.barCol}>
            <Text style={[styles.barValue, isMax && styles.barValueHigh]}>{d.value > 0 ? d.value : ''}</Text>
            <View style={[styles.bar, { height: barH }, isMax && styles.barHigh]} />
            <Text style={[styles.barLabel, isMax && styles.barLabelHigh]}>{d.day}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function Stats() {
  const { t, i18n } = useTranslation();
  const profile = useUserStore(s => s.profile);
  const relapses = useUserStore(s => s.relapses);
  const entries = useDiaryStore(s => s.entries);
  const [period, setPeriod] = useState<'7d' | '30d' | '1a'>('30d');

  const quitDateStr = profile?.quitDate ?? new Date().toISOString().split('T')[0];
  const quitDate = parseQuitDate(quitDateStr);
  const cigarettesPerDay = profile?.cigarettesPerDay ?? 15;
  const pricePerPack = profile?.pricePerPack ?? 12.5;
  const cigarettesPerPack = profile?.cigarettesPerPack ?? 20;
  const currency = profile?.currency ?? 'BRL';
  const locale = localeFor(i18n.language);

  const days = PERIODS[period];
  const savingsPoints = buildSavingsPoints(quitDate, days, cigarettesPerDay, pricePerPack, cigarettesPerPack);
  const totalSaved = savingsPoints.length > 0 ? savingsPoints[savingsPoints.length - 1].value : 0;

  const costPerDay = (cigarettesPerDay / cigarettesPerPack) * pricePerPack;
  const todaySavings = Math.round(costPerDay);

  const daysSince = Math.floor((Date.now() - quitDate.getTime()) / 86400000);

  const totalRelapses = relapses.length;
  const relapsesCigs = relapses.reduce((s, r) => s + r.cigarettes, 0);
  const diaryCedeuEntries = entries.filter(e => !e.resisted);
  const diaryCigsTotal = diaryCedeuEntries.reduce((sum, e) => sum + (e.cigarettesSmoked ?? 0), 0);
  const totalCigsSmoked = relapsesCigs + diaryCigsTotal;
  const cigarettesWouldHaveSmoked = Math.max(1, Math.floor((daysSince * cigarettesPerDay)));
  const avoidanceRate = cigarettesWouldHaveSmoked > 0
    ? Math.round(((cigarettesWouldHaveSmoked - totalCigsSmoked) / cigarettesWouldHaveSmoked) * 100)
    : 100;
  const hasAnySlip = totalRelapses > 0 || diaryCedeuEntries.length > 0;

  const cravingsWon = entries.filter(e => e.resisted).length;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const recentEntries = entries.filter(e => new Date(e.timestamp) >= cutoff);

  const weekdayCounts = WEEKDAY_KEYS.map(key => ({ key, value: 0 }));
  recentEntries.forEach(e => {
    const dow = new Date(e.timestamp).getDay(); // 0=Sun
    weekdayCounts[dow].value += 1;
  });
  // Reorder: Mon..Sun (1..0), translate labels
  const orderedDays = [...weekdayCounts.slice(1), weekdayCounts[0]].map(d => ({
    day: t(`stats.weekdays.${d.key}`),
    value: d.value,
    key: d.key,
  }));

  const hardest = orderedDays.reduce((a, b) => b.value > a.value ? b : a, orderedDays[0]);
  const insight = hardest.value > 0
    ? t('stats.hardestDay', { day: hardest.day })
    : t('stats.noCravings');

  const periodLabel = period === '7d' ? t('stats.last7days') : period === '30d' ? t('stats.last30days') : t('stats.lastYear');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t('stats.title')}</Text>
            <Text style={styles.subtitle}>{periodLabel}</Text>
          </View>
          <View style={styles.periodSelector}>
            {(['7d', '30d', '1a'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Savings chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>{t('stats.accumulatedSavings')}</Text>
          <View style={styles.chartValueRow}>
            <Text style={styles.chartMainValue}>{formatCurrency(totalSaved, currency, locale)}</Text>
            {todaySavings > 0 && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>{t('stats.todaySavings', { amount: formatCurrency(todaySavings, currency, locale) })}</Text>
              </View>
            )}
          </View>
          <LineChart points={savingsPoints} days={days} noDataLabel={t('stats.fewData')} />
        </View>

        {/* Cravings by weekday */}
        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>{t('stats.cravingsByWeekday')}</Text>
          <Text style={styles.chartInsight}>{insight}</Text>
          <BarChart data={orderedDays} />
        </View>

        {/* Relapse section */}
        <View style={styles.chartCard}>
          <View style={styles.relapseHeader}>
            <Text style={styles.chartLabel}>{t('stats.relapses')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/relapse')}
              style={styles.relapseBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.relapseBtnText}>{t('stats.register')}</Text>
            </TouchableOpacity>
          </View>

          {!hasAnySlip ? (
            <Text style={styles.relapseEmpty}>{t('stats.noRelapses')}</Text>
          ) : (
            <>
              <View style={styles.relapseStat}>
                <View style={styles.relapseStatItem}>
                  <Text style={styles.relapseStatValue}>{diaryCedeuEntries.length}</Text>
                  <Text style={styles.relapseStatLabel}>{t('stats.cravingsCeded', { count: diaryCedeuEntries.length })}</Text>
                </View>
                <View style={styles.relapseDivider} />
                <View style={styles.relapseStatItem}>
                  <Text style={styles.relapseStatValue}>{totalCigsSmoked}</Text>
                  <Text style={styles.relapseStatLabel}>{t('stats.cigsSmoked')}</Text>
                </View>
                <View style={styles.relapseDivider} />
                <View style={styles.relapseStatItem}>
                  <Text style={[styles.relapseStatValue, { color: Colors.primary }]}>{Math.max(0, avoidanceRate)}%</Text>
                  <Text style={styles.relapseStatLabel}>{t('stats.avoided')}</Text>
                </View>
              </View>
              <View style={styles.avoidanceBarBg}>
                <View style={[styles.avoidanceBarFill, { width: `${Math.max(0, avoidanceRate)}%` as any }]} />
              </View>
              <Text style={styles.relapseInsight}>
                {totalRelapses > 0
                  ? t('stats.relapseInsight', { count: totalRelapses })
                  : ''}
                {t('stats.relapseInsightSuffix', { rate: Math.max(0, avoidanceRate) })}
              </Text>
            </>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>✦</Text>
            <Text style={styles.summaryValue}>{formatCurrency((cigarettesPerDay / cigarettesPerPack) * pricePerPack * Math.max(daysSince, 0), currency, locale)}</Text>
            <Text style={styles.summaryLabel}>{t('stats.totalSaved')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryIcon, { color: Colors.amber }]}>◉</Text>
            <Text style={styles.summaryValue}>{Math.max(daysSince, 0)}d</Text>
            <Text style={styles.summaryLabel}>{t('stats.totalJourney')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryIcon, { color: Colors.secondary }]}>○</Text>
            <Text style={styles.summaryValue}>{cravingsWon}</Text>
            <Text style={styles.summaryLabel}>{t('stats.cravingsWon')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 16, paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.muted },
  periodSelector: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 10, padding: 3, gap: 2 },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  periodBtnActive: { backgroundColor: Colors.card2 },
  periodBtnText: { fontSize: 12, color: Colors.muted, fontWeight: '500' },
  periodBtnTextActive: { color: Colors.white, fontWeight: '700' },
  chartCard: { backgroundColor: Colors.card, borderRadius: 18, padding: 18, gap: 10 },
  chartLabel: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 1 },
  chartValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chartMainValue: { fontSize: 28, fontWeight: '800', color: Colors.white },
  todayBadge: { backgroundColor: Colors.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  todayBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  chartInsight: { fontSize: 13, color: Colors.muted },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  xLabel: { fontSize: 11, color: Colors.muted },
  barChartWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 112, paddingTop: 8 },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  barValue: { fontSize: 11, fontWeight: '600', color: Colors.muted },
  barValueHigh: { color: Colors.amber },
  bar: { width: 26, borderRadius: 6, backgroundColor: Colors.secondary + '88' },
  barHigh: { backgroundColor: Colors.amber },
  barLabel: { fontSize: 11, color: Colors.muted, fontWeight: '500' },
  barLabelHigh: { color: Colors.amber, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 16, padding: 14, gap: 4 },
  summaryIcon: { fontSize: 20, color: Colors.primary },
  summaryValue: { fontSize: 16, fontWeight: '800', color: Colors.white },
  summaryLabel: { fontSize: 11, color: Colors.muted, lineHeight: 15 },

  relapseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  relapseBtn: { backgroundColor: Colors.red + '22', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  relapseBtnText: { fontSize: 12, color: Colors.red, fontWeight: '600' },
  relapseEmpty: { fontSize: 13, color: Colors.muted, textAlign: 'center', paddingVertical: 8 },
  relapseStat: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  relapseStatItem: { alignItems: 'center', gap: 2 },
  relapseStatValue: { fontSize: 22, fontWeight: '800', color: Colors.white },
  relapseStatLabel: { fontSize: 11, color: Colors.muted },
  relapseDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  avoidanceBarBg: { height: 6, backgroundColor: Colors.card2, borderRadius: 4 },
  avoidanceBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 4 },
  relapseInsight: { fontSize: 12, color: Colors.muted, lineHeight: 18 },
});
