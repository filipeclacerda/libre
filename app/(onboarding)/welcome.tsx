import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/src/constants/colors';

export default function Welcome() {
  const { t } = useTranslation();

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.28)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.18, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.07, duration: 1100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.28, duration: 1100, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>libre<Text style={styles.dot}>•</Text></Text>

        <View style={styles.heroContainer}>
          {/* Pulsing outer ring */}
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}
          />
          {/* Static glow behind */}
          <View style={styles.glowOuter} />
          {/* White circle with lung image clipped to circle */}
          <View style={styles.circle}>
            <Image
              source={require('@/assets/lung_white.png')}
              style={styles.lungImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.headline}>
            {t('onboarding.welcome.headline')}
            <Text style={styles.headlineGreen}>{t('onboarding.welcome.headlineGreen')}</Text>
          </Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(onboarding)/profile')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{t('onboarding.welcome.start')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  logo: { marginTop: 8, fontSize: 22, fontWeight: '700', color: Colors.white, letterSpacing: -0.5 },
  dot: { color: Colors.primary },

  heroContainer: { alignItems: 'center', justifyContent: 'center', width: 220, height: 220 },

  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  glowOuter: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: Colors.primary,
    opacity: 0.12,
  },

  // White circle — lung image (white bg) blends naturally into it
  circle: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Image sized so the lung fills the circle and the cigarette (bottom portion) is cropped out
  lungImage: {
    width: 90,
    height: 145,   // taller than circle → bottom (cigarette) gets clipped
    position: 'absolute',
    top: 0,
  },

  textContainer: { alignItems: 'center', gap: 12 },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  headlineGreen: { color: Colors.primary },
  subtitle: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  actions: { width: '100%', gap: 16, alignItems: 'center' },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  secondaryLink: { color: Colors.muted, fontSize: 14 },
  secondaryLinkBold: { color: Colors.white, fontWeight: '600' },
});
