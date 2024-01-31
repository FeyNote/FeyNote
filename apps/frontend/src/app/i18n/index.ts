import i18next from 'i18next';
import Backend, { HttpBackendOptions } from 'i18next-http-backend';
import { FALLBACK_LANGUAGE, detectLanguage } from './detectLanguage';

const language = detectLanguage();

i18next.use(Backend).init<HttpBackendOptions>({
  debug: true,
  backend: {
    loadPath: '/locales/{{lng}}.json',
    request: (options, url, payload, callback) => {
      console.log('request;', url.toLowerCase());
      fetch(url.toLowerCase())
        .then((res) => res.json())
        .then((json) => callback(null, { status: 200, data: json }))
        .catch((err) =>
          callback(err, {
            status: err.status || 500,
            data: { examplestr: 'example string' },
          })
        );
    },
  },
  interpolation: {
    escapeValue: false,
  },
  lng: language,
  fallbackLng: FALLBACK_LANGUAGE,
});
