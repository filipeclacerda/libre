import { Stack } from 'expo-router';
import { Colors } from '@/src/constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="when" />
      <Stack.Screen name="consumption" />
      <Stack.Screen name="triggers" />
    </Stack>
  );
}
