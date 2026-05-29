import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLanguage = 'pt' | 'en';

interface LanguageState {
  language: SupportedLanguage | null; // null means "use device locale"
  setLanguage: (lang: SupportedLanguage) => void;
  clearLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (lang) => set({ language: lang }),
      clearLanguage: () => set({ language: null }),
    }),
    {
      name: 'libre-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
