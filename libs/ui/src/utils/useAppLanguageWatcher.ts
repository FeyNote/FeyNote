import { AppPreferences, PreferenceNames } from '@feynote/shared-utils';
import { useEffect } from 'react';
import { detectLanguage } from '../i18n/detectLanguage';
import i18next from 'i18next';
import { setBrowserLanguage } from '../i18n/setBrowserLanguage';

/**
 * Watches and applies user preference for app-wide theme (color scheme)
 */
export const useAppLanguageWatcher = (preferences: AppPreferences) => {
  const userPreferredLanguage = preferences[PreferenceNames.Language];

  useEffect(() => {
    const language = preferences[PreferenceNames.Language] || detectLanguage();

    if (i18next.language !== language) {
      i18next.changeLanguage(language);
      setBrowserLanguage(language);
    }
  }, [userPreferredLanguage]);
};
