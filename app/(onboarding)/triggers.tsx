import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';

const TRIGGER_IDS = ['stress', 'coffee', 'alcohol', 'meal', 'boredom', 'social', 'work', 'anxiety'];

export default function Triggers() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(['stress', 'coffee']);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader step={4} total={4} onBack={() => router.back()} />

      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.triggers.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.triggers.subtitle')}</Text>

        <View style={styles.chips}>
          {TRIGGER_IDS.map(id => {
            const isSelected = selected.includes(id);
            return (
              <TouchableOpacity
                key={id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggle(id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {t(`onboarding.triggers.items.${id}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, selected.length === 0 && styles.primaryButtonDisabled]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
          disabled={selected.length === 0}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.triggers.startBtn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 28, gap: 20 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 14, color: Colors.muted, fontWeight: '500' },
  chipTextSelected: { color: Colors.primary, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingBottom: 20 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
