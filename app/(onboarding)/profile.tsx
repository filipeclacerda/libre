import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';
import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { useUserStore } from '@/src/store/userStore';

export default function Profile() {
  const { t } = useTranslation();
  const setProfile = useUserStore(s => s.setProfile);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  function validate() {
    let ok = true;
    if (!name.trim()) { setNameError(t('onboarding.profile.nameError')); ok = false; } else setNameError('');
    if (!email.trim() || !email.includes('@')) { setEmailError(t('onboarding.profile.emailError')); ok = false; } else setEmailError('');
    return ok;
  }

  function handleContinue() {
    if (!validate()) return;
    setProfile({ name: name.trim(), email: email.trim().toLowerCase() });
    router.push('/(onboarding)/when');
  }

  const canContinue = name.trim().length > 0 && email.includes('@');

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader step={1} total={4} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('onboarding.profile.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.profile.subtitle')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('onboarding.profile.nameLabel')}</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder={t('onboarding.profile.namePh')}
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={t_ => { setName(t_); if (nameError) setNameError(''); }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('onboarding.profile.emailLabel')}</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder={t('onboarding.profile.emailPh')}
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={t_ => { setEmail(t_); if (emailError) setEmailError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.privacyCard}>
            <Text style={styles.privacyText}>{t('onboarding.profile.privacy')}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{t('onboarding.profile.continueBtn')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, gap: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, color: Colors.muted, lineHeight: 22 },
  field: { gap: 8 },
  label: { fontSize: 11, fontWeight: '600', color: Colors.muted, letterSpacing: 1 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.white,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: { borderColor: Colors.red + '88' },
  errorText: { fontSize: 12, color: Colors.red, marginTop: -4 },
  privacyCard: {
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  privacyText: { fontSize: 13, color: Colors.muted, lineHeight: 19 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
