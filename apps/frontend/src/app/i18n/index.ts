import i18next from 'i18next';
import { FALLBACK_LANGUAGE, detectLanguage } from './detectLanguage';
import { initReactI18next } from 'react-i18next';
import { i18nextCustomBackend } from './i18nextCustomBackend';
import { setBrowserLanguage } from './setBrowserLanguage';

const language = detectLanguage();

i18next
  .use(i18nextCustomBackend)
  .use(initReactI18next)
  .init({
    load: 'currentOnly',
    lowerCaseLng: true,
    react: {
      useSuspense: true,
    },
    interpolation: {
      escapeValue: false,
    },
    lng: language,
    fallbackLng: FALLBACK_LANGUAGE,
  });

setBrowserLanguage(language);
