import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { useUserStore } from '@/src/store/userStore';

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.stepperBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onChange(Math.max(1, value - 1))}
          activeOpacity={0.7}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperValue}>
          <Text style={styles.stepperValueNum}>{value}</Text>
          <Text style={styles.stepperValueUnit}>cig</Text>
        </View>
        <TouchableOpacity
          style={[styles.stepperBtn, styles.stepperBtnActive]}
          onPress={() => onChange(value + 1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepperBtnText, styles.stepperBtnTextActive]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Consumption() {
  const { t } = useTranslation();
  const setProfile = useUserStore(s => s.setProfile);
  const [cigarettesPerDay, setCigarettesPerDay] = useState(15);
  const [price, setPrice] = useState('12,50');
  const [perPack, setPerPack] = useState(20);

  const priceNum = parseFloat(price.replace(',', '.')) || 0;
  const costPerDay = (cigarettesPerDay / perPack) * priceNum;
  const costPerMonth = Math.round(costPerDay * 30);
  const costPerYear = Math.round(costPerDay * 365);

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader step={3} total={4} onBack={() => router.back()} onSkip={() => router.push('/(onboarding)/triggers')} />

      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.consumption.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.consumption.subtitle')}</Text>

        <Stepper label={t('onboarding.consumption.cigsPerDay')} value={cigarettesPerDay} onChange={setCigarettesPerDay} />

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>{t('onboarding.consumption.packPrice')}</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputPrefix}>R$</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.muted}
            />
            <Text style={styles.inputSuffix}>BRL</Text>
          </View>
        </View>

        <Stepper label={t('onboarding.consumption.cigsPerPack')} value={perPack} onChange={setPerPack} />

        {costPerMonth > 0 && (
          <View style={styles.calcCard}>
            <Text style={styles.calcText}>
              {t('onboarding.consumption.calcText')}
              <Text style={styles.calcHighlight}>{t('onboarding.consumption.calcMonth', { amount: costPerMonth })}</Text>
              {t('onboarding.consumption.calcYearSuffix')}
              <Text style={styles.calcHighlight}>{t('onboarding.consumption.calcYear', { amount: costPerYear.toLocaleString('pt-BR') })}</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
              const priceNum = parseFloat(price.replace(',', '.')) || 0;
              setProfile({ cigarettesPerDay, pricePerPack: priceNum, cigarettesPerPack: perPack });
              router.push('/(onboarding)/triggers');
            }}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.consumption.continueBtn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 28, gap: 16 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.muted, letterSpacing: 1, marginBottom: 8 },
  stepperBlock: { gap: 0 },
  stepperRow: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 52,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  stepperBtnActive: { backgroundColor: Colors.primary },
  stepperBtnText: { fontSize: 22, color: Colors.muted, fontWeight: '300' },
  stepperBtnTextActive: { color: Colors.white },
  stepperValue: { flex: 1, alignItems: 'center', gap: 1 },
  stepperValueNum: { fontSize: 24, fontWeight: '700', color: Colors.white },
  stepperValueUnit: { fontSize: 11, color: Colors.muted },
  fieldBlock: { gap: 0 },
  inputRow: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  inputPrefix: { fontSize: 15, color: Colors.muted, marginRight: 8 },
  input: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.white },
  inputSuffix: { fontSize: 13, color: Colors.muted },
  calcCard: {
    backgroundColor: Colors.secondary + '1A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.secondary + '33',
  },
  calcText: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  calcHighlight: { color: Colors.primary, fontWeight: '700' },
  footer: { paddingHorizontal: 24, paddingBottom: 20 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
