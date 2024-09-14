import { ModuleType } from 'i18next';

export const i18nextCustomBackend = {
  type: 'backend' as ModuleType,
  read: (
    language: string,
    _: string,
    callback: (err: Error | null, json: Record<string, string> | null) => void,
  ) => {
    fetch(`/locales/${language}.json`)
      .then((res) => res.json())
      .then((json) => callback(null, json))
      .catch((err) => callback(err, null));
  },
};
