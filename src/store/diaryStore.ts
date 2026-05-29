import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CravingEntry {
  id: string;
  timestamp: string; // ISO
  intensity: 1 | 2 | 3 | 4 | 5;
  trigger: string;
  resisted: boolean;
  cigarettesSmoked?: number; // only when resisted = false
  notes?: string;
}

interface DiaryStore {
  entries: CravingEntry[];
  addEntry: (e: Omit<CravingEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
}

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (e) =>
        set((s) => ({
          entries: [
            { ...e, id: Date.now().toString(), timestamp: new Date().toISOString() },
            ...s.entries,
          ],
        })),
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'libre-diary', storage: createJSONStorage(() => AsyncStorage) }
  )
);
