import i18next, { ModuleType } from 'i18next';
import { FALLBACK_LANGUAGE, detectLanguage } from './detectLanguage';
import { initReactI18next } from 'react-i18next';

const language = detectLanguage();

const customBackend = {
  type: 'backend' as ModuleType,
  read: (
    language: string,
    _: string,
    callback: (err: Error | null, json: Record<string, string> | null) => void
  ) => {
    fetch(`/locales/${language.toLowerCase()}.json`)
      .then((res) => res.json())
      .then((json) => callback(null, json))
      .catch((err) => callback(err, null));
  },
};

i18next
  .use(customBackend)
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
