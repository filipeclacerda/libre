import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface Props {
  step: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
}

export function OnboardingHeader({ step, total, onBack, onSkip }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.stepLabel}>ETAPA {step} DE {total}</Text>

      {onSkip ? (
        <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.progressBar}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressSegment, i < step && styles.progressSegmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: Colors.white, lineHeight: 28, marginTop: -2 },
  stepLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: Colors.muted, letterSpacing: 0.5 },
  skipText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  placeholder: { width: 36 },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 0,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.card,
  },
  progressSegmentActive: { backgroundColor: Colors.primary },
});
