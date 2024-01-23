import i18next from 'i18next';
import Backend, { HttpBackendOptions } from 'i18next-http-backend';
import { FALLBACK_LANGUAGE, detectLanguage } from './detectLanguage';

const language = detectLanguage();
console.log('detected language;', language);
i18next.use(Backend).init<HttpBackendOptions>({
  load: 'languageOnly',
  backend: {
    loadPath: '/public/locales/{{lng}}.json',
    request: (options, url, payload, callback) => {
      fetch(url.toLowerCase())
        .then((res) => res.json())
        .then((json) => callback(null, { status: 200, data: json }))
        .catch((err) => callback(err, { status: err.status || 500, data: {} }));
    },
  },
  lng: language,
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});
