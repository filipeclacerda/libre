import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import pt from './locales/pt.json';
import en from './locales/en.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

/** Resolve device locale to a supported language, falling back to 'pt'. */
function getDeviceLanguage(): string {
  const locales = Localization.getLocales();
  const tag = locales[0]?.languageTag ?? 'pt';
  // Match 'en-US', 'en-GB', etc. to 'en'; 'pt-BR', 'pt-PT' to 'pt'
  const primary = tag.split('-')[0].toLowerCase();
  if (primary in resources) return primary;
  return 'pt';
}

export function initI18n(manualLanguage?: string | null) {
  const lng = manualLanguage ?? getDeviceLanguage();

  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng,
        fallbackLng: 'pt',
        interpolation: {
          escapeValue: false,
        },
      });
  } else if (i18n.language !== lng) {
    i18n.changeLanguage(lng);
  }

  return i18n;
}

export default i18n;
