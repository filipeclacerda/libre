import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  quitDate: string;      // YYYY-MM-DD — original quit date, never changes
  streakStart?: string;  // YYYY-MM-DD — resets on relapse; defaults to quitDate
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
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          set(s => ({
            profile: s.profile ? { ...s.profile, streakStart: `${yyyy}-${mm}-${dd}` } : null,
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
