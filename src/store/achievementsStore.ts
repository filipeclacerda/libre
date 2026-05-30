import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementContext, getEarnedIds } from '../lib/achievements';

interface AchievementsStore {
  /** id → ISO timestamp of when it was unlocked */
  unlocked: Record<string, string>;
  /** Queue of ids to celebrate — drained one by one */
  pendingCelebration: string[];
  /** True once AsyncStorage has finished loading persisted data */
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  checkAndUnlock: (ctx: AchievementContext) => void;
  dismissCelebration: () => void;
  reset: () => void;
}

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlocked: {},
      pendingCelebration: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      checkAndUnlock: (ctx) => {
        // Guard: never run before persisted data is loaded from AsyncStorage.
        // Without this, unlocked is {} on first render and every achievement
        // looks "new", causing all celebrations to fire on every app open.
        if (!get().hasHydrated) return;

        const earned = getEarnedIds(ctx);
        const current = get().unlocked;
        const fresh = earned.filter(id => !current[id]);
        if (fresh.length === 0) return;

        const now = new Date().toISOString();
        const updated = { ...current };
        fresh.forEach(id => { updated[id] = now; });

        set(s => ({
          unlocked: updated,
          pendingCelebration: [...s.pendingCelebration, ...fresh],
        }));
      },

      dismissCelebration: () => {
        set(s => ({ pendingCelebration: s.pendingCelebration.slice(1) }));
      },

      reset: () => set({ unlocked: {}, pendingCelebration: [] }),
    }),
    {
      name: 'libre-achievements',
      storage: createJSONStorage(() => AsyncStorage),
      // pendingCelebration and hasHydrated must NOT be persisted.
      partialize: (state) => ({ unlocked: state.unlocked }),
      onRehydrateStorage: () => (state) => {
        // Called once AsyncStorage finishes loading — safe to check achievements now.
        state?.setHasHydrated(true);
      },
    }
  )
);
