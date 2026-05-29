import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementContext, getEarnedIds } from '../lib/achievements';

interface AchievementsStore {
  /** id → ISO timestamp of when it was unlocked */
  unlocked: Record<string, string>;
  /** Queue of ids to celebrate — drained one by one */
  pendingCelebration: string[];
  checkAndUnlock: (ctx: AchievementContext) => void;
  dismissCelebration: () => void;
  reset: () => void;
}

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlocked: {},
      pendingCelebration: [],

      checkAndUnlock: (ctx) => {
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
    }
  )
);
