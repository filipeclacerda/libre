import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppMetaStore {
  askedForReview: boolean;
  setAskedForReview: () => void;
}

export const useAppMetaStore = create<AppMetaStore>()(
  persist(
    (set) => ({
      askedForReview: false,
      setAskedForReview: () => set({ askedForReview: true }),
    }),
    { name: 'libre-app-meta', storage: createJSONStorage(() => AsyncStorage) }
  )
);
