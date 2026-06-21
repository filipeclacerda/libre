import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useDiaryStore } from '@/src/store/diaryStore';
import { useUserStore } from '@/src/store/userStore';
import { TRIGGER_ID_TO_DIARY_KEY, TriggerId } from '@/src/constants/triggers';

type SOSView = 'menu' | 'breathe' | 'wait' | 'record';

// 4-7-8 breathing technique — phase durations are fixed, names/instructions translated at render time
const BREATHE_PHASE_DEFS = [
  { key: 'inspire', duration: 4, targetScale: 1.4 },
  { key: 'hold',    duration: 7, targetScale: 1.4 },
  { key: 'expire',  duration: 8, targetScale: 1.0 },
];
const TOTAL_CYCLES = 3;

const QUICK_TRIGGER_KEYS = ['Estresse', 'Tédio', 'Ansiedade', 'Social', 'Trabalho'];

// ─────────────────────────────────────────────
// Breathing exercise
// ─────────────────────────────────────────────
function BreatheView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTime, setPhaseTime] = useState(BREATHE_PHASE_DEFS[0].duration);
  const [cycle, setCycle] = useState(1);
  const [done, setDone] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1.0)).current;

  const stateRef = useRef({ phaseIdx: 0, cycle: 1 });
  stateRef.current = { phaseIdx, cycle };

  useEffect(() => {
    if (done) return;
    Animated.timing(scaleAnim, {
      toValue: BREATHE_PHASE_DEFS[phaseIdx].targetScale,
      duration: BREATHE_PHASE_DEFS[phaseIdx].duration * 1000,
      useNativeDriver: true,
    }).start();
  }, [phaseIdx, done]);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setPhaseTime(prev => {
        if (prev > 1) return prev - 1;

        const { phaseIdx: pi, cycle: cy } = stateRef.current;
        const next = (pi + 1) % BREATHE_PHASE_DEFS.length;

        if (next === 0 && cy >= TOTAL_CYCLES) {
          setDone(true);
          return 0;
        }
        if (next === 0) setCycle(c => c + 1);
        setPhaseIdx(next);
        return BREATHE_PHASE_DEFS[next].duration;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  if (done) {
    return (
      <View style={ex.wrap}>
        <Text style={ex.doneEmoji}>✨</Text>
        <Text style={ex.doneTitle}>{t('sos.breatheDone')}</Text>
        <Text style={ex.doneSub}>{t('sos.breatheDoneSub')}</Text>
        <TouchableOpacity style={ex.pill} onPress={onBack} activeOpacity={0.8}>
          <Text style={ex.pillText}>{t('sos.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const phase = BREATHE_PHASE_DEFS[phaseIdx];

  return (
    <View style={ex.wrap}>
      <View style={ex.cyclePill}>
        <Text style={ex.cycleText}>{t('sos.cycle', { current: cycle, total: TOTAL_CYCLES })}</Text>
      </View>

      <View style={ex.circleWrap}>
        <Animated.View style={[ex.circle, { transform: [{ scale: scaleAnim }] }]} />
        <View style={ex.circleLabel}>
          <Text style={ex.phaseName}>{t(`sos.breathePhases.${phase.key}`)}</Text>
          <Text style={ex.phaseCountdown}>{phaseTime}s</Text>
        </View>
      </View>

      <Text style={ex.instruction}>{t(`sos.breathePhases.${phase.key}Instruction`)}</Text>

      <View style={ex.dots}>
        {BREATHE_PHASE_DEFS.map((_, i) => (
          <View key={i} style={[ex.dot, i === phaseIdx && ex.dotActive]} />
        ))}
      </View>

      <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={ex.link}>
        <Text style={ex.linkText}>{t('sos.backArrow')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// 3-minute wait timer
// ─────────────────────────────────────────────
function WaitView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const TOTAL = 180;
  const [seconds, setSeconds] = useState(TOTAL);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  const progress = (TOTAL - seconds) / TOTAL;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const getMessage = () => {
    if (seconds > 120) return t('sos.waitMsg1');
    if (seconds > 60)  return t('sos.waitMsg2');
    if (seconds > 0)   return t('sos.waitMsg3');
    return t('sos.waitMsg4');
  };

  return (
    <View style={ex.wrap}>
      {done ? (
        <>
          <Text style={ex.doneEmoji}>🎉</Text>
          <Text style={ex.doneTitle}>{t('sos.waitDoneTitle')}</Text>
          <Text style={ex.doneSub}>{t('sos.waitDoneSub')}</Text>
          <TouchableOpacity style={ex.pill} onPress={onBack} activeOpacity={0.8}>
            <Text style={ex.pillText}>{t('sos.back')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={ex.waitLabel}>{t('sos.holdOn')}</Text>
          <Text style={ex.waitCountdown}>{mins}:{String(secs).padStart(2, '0')}</Text>
          <View style={ex.progressBg}>
            <View style={[ex.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={ex.instruction}>{getMessage()}</Text>
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={ex.link}>
            <Text style={ex.linkText}>{t('sos.backArrow')}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Quick craving record (inline, no navigation)
// ─────────────────────────────────────────────
function RecordView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const addEntry = useDiaryStore(s => s.addEntry);
  const profile = useUserStore(s => s.profile);
  const mapped = profile?.triggers?.[0] ? TRIGGER_ID_TO_DIARY_KEY[profile.triggers[0] as TriggerId] : undefined;
  const defaultTrigger = mapped && QUICK_TRIGGER_KEYS.includes(mapped) ? mapped : 'Estresse';
  const [intensity, setIntensity] = useState<1|2|3|4|5>(3);
  const [trigger, setTrigger] = useState(defaultTrigger);
  const [resisted, setResisted] = useState(true);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    addEntry({ intensity, trigger, resisted, notes: notes.trim() || undefined });
    setSaved(true);
  }

  if (saved) {
    return (
      <View style={ex.wrap}>
        <Text style={ex.doneEmoji}>{resisted ? '💪' : '🤍'}</Text>
        <Text style={ex.doneTitle}>{resisted ? t('sos.savedResisted') : t('sos.savedCeded')}</Text>
        <Text style={ex.doneSub}>
          {resisted ? t('sos.savedResistedSub') : t('sos.savedCededSub')}
        </Text>
        <TouchableOpacity style={ex.pill} onPress={onBack} activeOpacity={0.8}>
          <Text style={ex.pillText}>{t('sos.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={ex.recordWrap} showsVerticalScrollIndicator={false}>
      <Text style={ex.recordTitle}>{t('sos.recordTitle')}</Text>

      <Text style={ex.recordLabel}>{t('sos.recordIntensity')}</Text>
      <View style={ex.starRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setIntensity((i + 1) as 1|2|3|4|5)} activeOpacity={0.7}>
            <Text style={{ fontSize: 30, color: i < intensity ? Colors.amber : Colors.border }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={ex.recordLabel}>{t('sos.recordTrigger')}</Text>
      <View style={ex.chips}>
        {QUICK_TRIGGER_KEYS.map(key => (
          <TouchableOpacity
            key={key}
            style={[ex.chip, trigger === key && ex.chipActive]}
            onPress={() => setTrigger(key)}
            activeOpacity={0.7}
          >
            <Text style={[ex.chipText, trigger === key && ex.chipTextActive]}>
              {t(`sos.quickTriggers.${key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={ex.recordLabel}>{t('sos.recordResult')}</Text>
      <View style={ex.resistRow}>
        <TouchableOpacity
          style={[ex.resistBtn, resisted && ex.resistBtnGreen]}
          onPress={() => setResisted(true)}
          activeOpacity={0.7}
        >
          <Text style={[ex.resistBtnText, resisted && ex.resistBtnTextGreen]}>{t('sos.recordResisted')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[ex.resistBtn, !resisted && ex.resistBtnRed]}
          onPress={() => setResisted(false)}
          activeOpacity={0.7}
        >
          <Text style={[ex.resistBtnText, !resisted && ex.resistBtnTextRed]}>{t('sos.recordCeded')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={ex.recordLabel}>{t('sos.recordHowAreYou')}</Text>
      <TextInput
        style={ex.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('sos.recordNotesPh')}
        placeholderTextColor={Colors.muted + '66'}
        multiline
        maxLength={300}
        textAlignVertical="top"
      />

      <TouchableOpacity style={ex.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={ex.saveBtnText}>{t('sos.recordSave')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={[ex.link, { marginTop: 4 }]}>
        <Text style={ex.linkText}>{t('sos.backArrow')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// Main SOS screen
// ─────────────────────────────────────────────
export default function SOS() {
  const { t } = useTranslation();
  const [view, setView] = useState<SOSView>('menu');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {view === 'breathe' && <BreatheView onBack={() => setView('menu')} />}
        {view === 'wait'    && <WaitView    onBack={() => setView('menu')} />}
        {view === 'record'  && <RecordView  onBack={() => setView('menu')} />}

        {view === 'menu' && (
          <>
            <View style={styles.content}>
              <Text style={styles.difficulty}>{t('sos.difficultMoment')}</Text>
              <Text style={styles.title}>{t('sos.title')}</Text>
              <Text style={styles.subtitle}>{t('sos.subtitle')}</Text>
            </View>

            <View style={styles.options}>
              <TouchableOpacity style={styles.optionCard} onPress={() => setView('breathe')} activeOpacity={0.8}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '44' }]}>
                  <Text style={styles.optionIconText}>🫁</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{t('sos.breathe')}</Text>
                  <Text style={styles.optionSubtitle}>{t('sos.breatheSubtitle')}</Text>
                </View>
                <View style={styles.optionArrowWrap}>
                  <Text style={styles.optionArrow}>›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={() => setView('wait')} activeOpacity={0.8}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '44' }]}>
                  <Text style={styles.optionIconText}>⏱</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{t('sos.wait')}</Text>
                  <Text style={styles.optionSubtitle}>{t('sos.waitSubtitle')}</Text>
                </View>
                <View style={styles.optionArrowWrap}>
                  <Text style={styles.optionArrow}>›</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={() => setView('record')} activeOpacity={0.8}>
                <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '44' }]}>
                  <Text style={styles.optionIconText}>📓</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{t('sos.record')}</Text>
                  <Text style={styles.optionSubtitle}>{t('sos.recordSubtitle')}</Text>
                </View>
                <View style={styles.optionArrowWrap}>
                  <Text style={styles.optionArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.passedBtn}>
              <Text style={styles.passedBtnText}>{t('sos.alreadyPassed')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Styles — menu screen
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg + 'F2' },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, gap: 24 },
  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: Colors.muted },
  content: { gap: 10 },
  difficulty: { fontSize: 12, fontWeight: '700', color: Colors.amber, letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, lineHeight: 36, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  options: { gap: 12 },
  optionCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  optionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionIconText: { fontSize: 20 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  optionSubtitle: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  optionArrowWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.secondary + '33', alignItems: 'center', justifyContent: 'center',
  },
  optionArrow: { fontSize: 18, color: Colors.secondary, fontWeight: '700' },
  passedBtn: { alignItems: 'center' },
  passedBtnText: { fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },
});

// ─────────────────────────────────────────────
// Styles — exercise sub-screens
// ─────────────────────────────────────────────
const ex = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },

  cyclePill: {
    backgroundColor: Colors.card2, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  cycleText: { fontSize: 13, color: Colors.muted, fontWeight: '600' },
  circleWrap: { width: 210, height: 210, alignItems: 'center', justifyContent: 'center' },
  circle: {
    width: 130, height: 130, borderRadius: 65, position: 'absolute',
    backgroundColor: Colors.secondary + '2A',
    borderWidth: 2.5, borderColor: Colors.secondary + '88',
  },
  circleLabel: { alignItems: 'center', gap: 4 },
  phaseName: { fontSize: 16, fontWeight: '700', color: Colors.white },
  phaseCountdown: { fontSize: 36, fontWeight: '800', color: Colors.secondary },
  instruction: { fontSize: 15, color: Colors.muted, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.secondary, width: 24 },

  waitLabel: { fontSize: 12, fontWeight: '700', color: Colors.muted, letterSpacing: 1 },
  waitCountdown: { fontSize: 72, fontWeight: '800', color: Colors.white, letterSpacing: -2 },
  progressBg: { width: '80%', height: 6, backgroundColor: Colors.card2, borderRadius: 4 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 4 },

  doneEmoji: { fontSize: 56 },
  doneTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  doneSub: { fontSize: 15, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
  pill: {
    backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
  },
  pillText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  recordWrap: { paddingTop: 8, paddingBottom: 24, gap: 16, width: '100%' },
  recordTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  recordLabel: { fontSize: 11, fontWeight: '600', color: Colors.muted, letterSpacing: 1, marginBottom: -8 },
  starRow: { flexDirection: 'row', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.muted, fontWeight: '500' },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  resistRow: { flexDirection: 'row', gap: 10 },
  resistBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  resistBtnGreen: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  resistBtnRed: { backgroundColor: Colors.red + '22', borderColor: Colors.red },
  resistBtnText: { fontSize: 14, fontWeight: '600', color: Colors.muted },
  resistBtnTextGreen: { color: Colors.primary },
  resistBtnTextRed: { color: Colors.red },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  notesInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, padding: 14,
    color: Colors.white, fontSize: 14, lineHeight: 20,
    minHeight: 90,
  },

  link: { paddingVertical: 8 },
  linkText: { fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },
});
