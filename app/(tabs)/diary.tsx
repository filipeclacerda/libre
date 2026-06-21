import { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useDiaryStore, CravingEntry } from '@/src/store/diaryStore';
import { useUserStore } from '@/src/store/userStore';
import { TRIGGER_ID_TO_DIARY_KEY, TriggerId } from '@/src/constants/triggers';
import { syncNotifications } from '@/src/lib/notifications';
import { localeFor } from '@/src/lib/format';

const TRIGGER_KEYS = ['Estresse', 'Café', 'Álcool', 'Pós-refeição', 'Tédio', 'Social', 'Trabalho', 'Ansiedade'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatEntryDate(iso: string, t: (key: string, opts?: any) => string, locale: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `${t('diary.today')} · ${time}`;
  if (isYesterday) return `${t('diary.yesterday')} · ${time}`;
  return `${d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} · ${time}`;
}

function Stars({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 12, color: i < value ? Colors.amber : Colors.border }}>★</Text>
      ))}
    </View>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={modalStyles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i + 1)} activeOpacity={0.7}>
          <Text style={{ fontSize: 28, color: i < value ? Colors.amber : Colors.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AddCravingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const addEntry = useDiaryStore(s => s.addEntry);
  const profile = useUserStore(s => s.profile);
  const defaultTrigger = profile?.triggers?.[0]
    ? TRIGGER_ID_TO_DIARY_KEY[profile.triggers[0] as TriggerId] ?? 'Estresse'
    : 'Estresse';
  const [intensity, setIntensity] = useState<1|2|3|4|5>(3);
  const [trigger, setTrigger] = useState(defaultTrigger);
  const [resisted, setResisted] = useState(true);
  const [cigarettesSmoked, setCigarettesSmoked] = useState(1);
  const [notes, setNotes] = useState('');

  function handleSave() {
    addEntry({
      intensity, trigger, resisted, notes: notes.trim() || undefined,
      cigarettesSmoked: resisted ? undefined : cigarettesSmoked,
    });
    if (profile) {
      // Fire and forget — refreshes the craving-pattern alert once enough entries exist
      syncNotifications(profile, useDiaryStore.getState().entries);
    }
    onClose();
    setIntensity(3);
    setTrigger(defaultTrigger);
    setResisted(true);
    setCigarettesSmoked(1);
    setNotes('');
  }

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={modalStyles.overlay} onPress={onClose} />
      <SafeAreaView style={modalStyles.sheet} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={modalStyles.inner}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>{t('diary.modal.title')}</Text>

            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>{t('diary.modal.intensity')}</Text>
              <StarPicker value={intensity} onChange={v => setIntensity(v as 1|2|3|4|5)} />
            </View>

            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>{t('diary.modal.trigger')}</Text>
              <View style={modalStyles.chips}>
                {TRIGGER_KEYS.map(key => (
                  <TouchableOpacity
                    key={key}
                    style={[modalStyles.chip, trigger === key && modalStyles.chipActive]}
                    onPress={() => setTrigger(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[modalStyles.chipText, trigger === key && modalStyles.chipTextActive]}>
                      {t(`diary.triggers.${key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>{t('diary.modal.result')}</Text>
              <View style={modalStyles.resistRow}>
                <TouchableOpacity
                  style={[modalStyles.resistBtn, resisted && modalStyles.resistBtnActive]}
                  onPress={() => setResisted(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[modalStyles.resistBtnText, resisted && modalStyles.resistBtnTextActive]}>{t('diary.modal.resisted')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.resistBtn, !resisted && modalStyles.resistBtnRed]}
                  onPress={() => setResisted(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[modalStyles.resistBtnText, !resisted && modalStyles.resistBtnTextRed]}>{t('diary.modal.ceded')}</Text>
                </TouchableOpacity>
              </View>

              {!resisted && (
                <View style={modalStyles.cigRow}>
                  <Text style={modalStyles.cigLabel}>{t('diary.modal.howManyCigs')}</Text>
                  <View style={modalStyles.cigCounter}>
                    <TouchableOpacity
                      style={modalStyles.cigBtn}
                      onPress={() => setCigarettesSmoked(c => Math.max(1, c - 1))}
                      activeOpacity={0.7}
                    >
                      <Text style={modalStyles.cigBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={modalStyles.cigCount}>{cigarettesSmoked}</Text>
                    <TouchableOpacity
                      style={modalStyles.cigBtn}
                      onPress={() => setCigarettesSmoked(c => c + 1)}
                      activeOpacity={0.7}
                    >
                      <Text style={modalStyles.cigBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>{t('diary.modal.howAreYou')}</Text>
              <TextInput
                style={modalStyles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('diary.modal.notesPh')}
                placeholderTextColor={Colors.muted + '66'}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={modalStyles.saveBtnText}>{t('diary.modal.save')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function EntryCard({ entry, onDelete }: { entry: CravingEntry; onDelete: () => void }) {
  const { t, i18n } = useTranslation();
  const locale = localeFor(i18n.language);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardDate}>{formatEntryDate(entry.timestamp, t, locale)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[styles.resultBadge, entry.resisted ? styles.resultBadgeGreen : styles.resultBadgeRed]}>
            <Text style={[styles.resultBadgeText, entry.resisted ? styles.resultGreen : styles.resultRed]}>
              {entry.resisted ? t('diary.resisted') : t('diary.ceded')}
            </Text>
          </View>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 14, color: Colors.muted }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.triggerRow}>
          <Text style={styles.triggerLabel}>{t('diary.trigger')}</Text>
          <Text style={styles.triggerValue}>{t(`diary.triggers.${entry.trigger}`, { defaultValue: entry.trigger })}</Text>
        </View>
        <View style={styles.intensityRow}>
          <Text style={styles.triggerLabel}>{t('diary.intensity')}</Text>
          <Stars value={entry.intensity} />
        </View>
        {!entry.resisted && entry.cigarettesSmoked != null && (
          <View style={styles.triggerRow}>
            <Text style={styles.triggerLabel}>{t('diary.cigarettesSmoked')}</Text>
            <Text style={[styles.triggerValue, { color: Colors.red }]}>{entry.cigarettesSmoked}</Text>
          </View>
        )}
        {entry.notes ? (
          <Text style={styles.notes}>{entry.notes}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function Diary() {
  const { t } = useTranslation();
  const { entries, removeEntry } = useDiaryStore();
  const [modalVisible, setModalVisible] = useState(false);

  const wonCount = entries.filter(e => e.resisted).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('diary.title')}</Text>
        <Text style={styles.subtitle}>
          {entries.length > 0
            ? t('diary.subtitle', { count: entries.length, won: wonCount })
            : t('diary.noEntries')}
        </Text>

        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📓</Text>
            <Text style={styles.emptyTitle}>{t('diary.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('diary.emptyText')}</Text>
          </View>
        ) : (
          entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDelete={() => removeEntry(entry.id)} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddCravingModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, gap: 12, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.muted, marginTop: -8 },
  emptyState: { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 13, color: Colors.muted, fontWeight: '500' },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  resultBadgeGreen: { backgroundColor: Colors.primary + '22' },
  resultBadgeRed: { backgroundColor: Colors.red + '22' },
  resultBadgeText: { fontSize: 12, fontWeight: '600' },
  resultGreen: { color: Colors.primary },
  resultRed: { color: Colors.red },
  cardBody: { gap: 6 },
  triggerRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  intensityRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  triggerLabel: { fontSize: 12, color: Colors.muted },
  triggerValue: { fontSize: 13, color: Colors.white, fontWeight: '600' },
  notes: {
    fontSize: 13, color: Colors.muted, lineHeight: 18,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border,
    marginTop: 2, fontStyle: 'italic',
  },
  fab: {
    position: 'absolute', bottom: 80, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 28, color: Colors.white, lineHeight: 32 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  inner: {
    paddingHorizontal: 28, paddingTop: 12, paddingBottom: 52, gap: 24,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.white },
  section: { gap: 10 },
  label: { fontSize: 11, fontWeight: '600', color: Colors.muted, letterSpacing: 1 },
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
    flex: 1, paddingVertical: 13, borderRadius: 14,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  resistBtnActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  resistBtnRed: { backgroundColor: Colors.red + '22', borderColor: Colors.red },
  resistBtnText: { fontSize: 14, fontWeight: '600', color: Colors.muted },
  resistBtnTextActive: { color: Colors.primary },
  resistBtnTextRed: { color: Colors.red },
  notesInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, padding: 14,
    color: Colors.white, fontSize: 14, lineHeight: 20,
    minHeight: 90,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  cigRow: {
    backgroundColor: Colors.red + '11', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.red + '33',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cigLabel: { fontSize: 13, color: Colors.red, fontWeight: '500', flex: 1 },
  cigCounter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cigBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.red + '22', alignItems: 'center', justifyContent: 'center',
  },
  cigBtnText: { fontSize: 18, color: Colors.red, fontWeight: '700', lineHeight: 22 },
  cigCount: { fontSize: 20, fontWeight: '800', color: Colors.red, minWidth: 28, textAlign: 'center' },
});
