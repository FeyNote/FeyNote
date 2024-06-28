import { AppPreferences, PreferenceNames } from '@feynote/shared-utils';
import { useEffect } from 'react';

/**
 * Watches and applies user preference for app-wide font size
 */
export const useAppFontSizeWatcher = (preferences: AppPreferences) => {
  const userPreferredFontSize = preferences[PreferenceNames.FontSize];

  useEffect(() => {
    window.document.documentElement.style.fontSize = userPreferredFontSize;
  }, [userPreferredFontSize]);
};
