import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';
import { Colors } from '@/src/constants/colors';

export default function Index() {
  const hasHydrated = useUserStore(s => s._hasHydrated);
  const profile = useUserStore(s => s.profile);

  // Wait for AsyncStorage to rehydrate before deciding where to go
  if (!hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  const isOnboarded = !!(profile?.name && profile?.quitDate);
  return <Redirect href={isOnboarded ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
