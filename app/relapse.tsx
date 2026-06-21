import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { useUserStore } from '@/src/store/userStore';

export default function Relapse() {
  const { t } = useTranslation();
  const addRelapse = useUserStore(s => s.addRelapse);
  const [cigarettes, setCigarettes] = useState('1');
  const [step, setStep] = useState<'question' | 'reset-confirm' | 'continue-confirm'>('question');

  const cigCount = Math.max(1, parseInt(cigarettes, 10) || 1);

  function handleReset() {
    addRelapse(cigCount, true);
    router.replace('/(tabs)');
  }

  function handleContinue() {
    addRelapse(cigCount, false);
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {step === 'question' && (
          <>
            <View style={styles.content}>
              <Text style={styles.emoji}>🤍</Text>
              <Text style={styles.title}>{t('relapse.title')}</Text>
              <Text style={styles.subtitle}>{t('relapse.subtitle')}</Text>
            </View>

            {/* Cigarette count */}
            <View style={styles.countCard}>
              <Text style={styles.countLabel}>{t('relapse.howMany')}</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setCigarettes(String(Math.max(1, cigCount - 1)))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.counterInput}
                  value={cigarettes}
                  onChangeText={v => setCigarettes(v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setCigarettes(String(cigCount + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.options}>
              <TouchableOpacity
                style={styles.optionCardRed}
                onPress={() => setStep('reset-confirm')}
                activeOpacity={0.85}
              >
                <Text style={styles.optionTitleRed}>{t('relapse.resetCounter')}</Text>
                <Text style={styles.optionSubtitle}>{t('relapse.resetSubtitle')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => setStep('continue-confirm')}
                activeOpacity={0.85}
              >
                <Text style={styles.optionTitle}>{t('relapse.continueJourney')}</Text>
                <Text style={styles.optionSubtitle}>{t('relapse.continueSubtitle')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footnote}>{t('relapse.footnote')}</Text>
          </>
        )}

        {step === 'reset-confirm' && (
          <View style={styles.confirmWrap}>
            <Text style={styles.emoji}>🔄</Text>
            <Text style={styles.title}>{t('relapse.confirmReset')}</Text>
            <Text style={styles.subtitle}>{t('relapse.confirmResetSub')}</Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.confirmBtnRed} onPress={handleReset} activeOpacity={0.85}>
                <Text style={styles.confirmBtnRedText}>{t('relapse.yesReset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtnGhost} onPress={() => setStep('question')} activeOpacity={0.7}>
                <Text style={styles.confirmBtnGhostText}>{t('relapse.goBack')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'continue-confirm' && (
          <View style={styles.confirmWrap}>
            <Text style={styles.emoji}>💪</Text>
            <Text style={styles.title}>{t('relapse.recorded')}</Text>
            <Text style={styles.subtitle}>{t('relapse.recordedSub')}</Text>
            <TouchableOpacity style={styles.confirmBtnGreen} onPress={handleContinue} activeOpacity={0.85}>
              <Text style={styles.confirmBtnGreenText}>{t('relapse.continueMyJourney')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 20 },
  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: Colors.muted },

  content: { gap: 10, alignItems: 'center', paddingTop: 8 },
  emoji: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, textAlign: 'center', lineHeight: 36, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },

  countCard: {
    backgroundColor: Colors.card, borderRadius: 18, padding: 18, gap: 12, alignItems: 'center',
  },
  countLabel: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 1 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.card2, alignItems: 'center', justifyContent: 'center',
  },
  counterBtnText: { fontSize: 22, color: Colors.white, fontWeight: '600', lineHeight: 26 },
  counterInput: {
    fontSize: 36, fontWeight: '800', color: Colors.white,
    textAlign: 'center', minWidth: 64, padding: 0,
  },

  options: { gap: 12 },
  optionCardRed: {
    backgroundColor: Colors.red + '18', borderRadius: 16, padding: 18, gap: 4,
    borderWidth: 1.5, borderColor: Colors.red + '44',
  },
  optionCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 18, gap: 4 },
  optionTitleRed: { fontSize: 15, fontWeight: '700', color: Colors.red },
  optionTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  optionSubtitle: { fontSize: 13, color: Colors.muted },

  footnote: { textAlign: 'center', fontSize: 13, color: Colors.muted },

  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  confirmBtns: { gap: 12, width: '100%' },
  confirmBtnRed: {
    backgroundColor: Colors.red, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnRedText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  confirmBtnGreen: {
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnGreenText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  confirmBtnGhost: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  confirmBtnGhostText: { color: Colors.muted, fontSize: 15, fontWeight: '600' },
});
