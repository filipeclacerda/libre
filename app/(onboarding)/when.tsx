import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { useUserStore } from '@/src/store/userStore';

export default function When() {
  const { t, i18n } = useTranslation();
  const setProfile = useUserStore(s => s.setProfile);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';

  function formatDate(d: Date) {
    return d.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function onValueChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  }

  function handleContinue() {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setProfile({ quitDate: `${yyyy}-${mm}-${dd}` });
    router.push('/(onboarding)/consumption');
  }

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader
        step={2}
        total={4}
        onBack={() => router.back()}
        onSkip={() => router.push('/(onboarding)/consumption')}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{t('onboarding.when.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.when.subtitle')}</Text>

        {Platform.OS === 'ios' ? (
          <View style={styles.iosCard}>
            <Text style={styles.fieldLabel}>{t('onboarding.when.fieldLabel')}</Text>
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onValueChange={onValueChange}
              maximumDate={new Date()}
              locale={locale}
              style={styles.iosPicker}
              textColor={Colors.white}
              themeVariant="dark"
            />
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.androidCard}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.fieldLabel}>{t('onboarding.when.fieldLabel')}</Text>
              <Text style={styles.androidValue}>{formatDate(date)}</Text>
              <Text style={styles.androidHint}>{t('onboarding.when.tapToChange')}</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onValueChange={onValueChange}
                onDismiss={() => setShowPicker(false)}
                maximumDate={new Date()}
              />
            )}
          </>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>{t('onboarding.when.previewLabel')}</Text>
          <Text style={styles.previewValue}>{formatDate(date)}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{t('onboarding.when.infoText')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.when.continueBtn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, color: Colors.muted, lineHeight: 22 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.muted, letterSpacing: 1, marginBottom: 4 },
  iosCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, gap: 4 },
  iosPicker: { height: 140 },
  androidCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 18, gap: 4 },
  androidValue: { fontSize: 22, fontWeight: '700', color: Colors.white },
  androidHint: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  previewCard: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    gap: 4,
  },
  previewLabel: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  previewValue: { fontSize: 16, fontWeight: '700', color: Colors.white },
  infoCard: {
    backgroundColor: Colors.secondary + '22',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary + '44',
  },
  infoText: { fontSize: 14, color: Colors.muted, lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 20 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
