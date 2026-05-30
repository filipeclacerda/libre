import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serializeQuitDate } from '../lib/dateUtils';

export interface UserProfile {
  name: string;
  email: string;
  quitDate: string;      // ISO or YYYY-MM-DD — today → ISO with time; past → YYYY-MM-DD
  streakStart?: string;  // same format as quitDate; resets on relapse
  cigarettesPerDay: number;
  pricePerPack: number;
  cigarettesPerPack: number;
}

export interface Relapse {
  id: string;
  timestamp: string;   // ISO
  cigarettes: number;
  resetStreak: boolean;
}

interface UserStore {
  _hasHydrated: boolean;
  profile: UserProfile | null;
  relapses: Relapse[];
  setProfile: (p: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setHasHydrated: (v: boolean) => void;
  addRelapse: (cigarettes: number, resetStreak: boolean) => void;
  clearRelapses: () => void;
}

const DEFAULT_CONSUMPTION = {
  cigarettesPerDay: 15,
  pricePerPack: 12.5,
  cigarettesPerPack: 20,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      profile: null,
      relapses: [],

      setProfile: (p) =>
        set({ profile: { ...DEFAULT_CONSUMPTION, ...(get().profile ?? {}), ...p } as UserProfile }),

      clearProfile: () => set({ profile: null, relapses: [] }),

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addRelapse: (cigarettes, resetStreak) => {
        const relapse: Relapse = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          cigarettes,
          resetStreak,
        };
        set(s => ({ relapses: [relapse, ...s.relapses] }));

        if (resetStreak) {
          set(s => ({
            profile: s.profile
              ? { ...s.profile, streakStart: serializeQuitDate(new Date()) }
              : null,
          }));
        }
      },

      clearRelapses: () => set({ relapses: [] }),
    }),
    {
      name: 'libre-user',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
