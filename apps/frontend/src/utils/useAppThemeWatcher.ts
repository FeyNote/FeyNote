import {
  AppPreferences,
  AppTheme,
  PreferenceNames,
} from '@feynote/shared-utils';
import { useEffect } from 'react';

/**
 * Watches and applies user preference for app-wide theme (color scheme)
 */
export const useAppThemeWatcher = (preferences: AppPreferences) => {
  const userPreferredTheme = preferences[PreferenceNames.Theme];

  const updateTheme = (browserPrefersDark: boolean) => {
    if (userPreferredTheme === AppTheme.Default && browserPrefersDark) {
      // User has no preference, respect navigator theme
      document.documentElement.classList.toggle('ion-palette-dark', true);
    } else {
      // Respect user preference for theme -- future theme support would go here
      document.documentElement.classList.toggle(
        'ion-palette-dark',
        userPreferredTheme === AppTheme.Dark,
      );
    }
  };

  useEffect(() => {
    const prefersDarkMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );

    updateTheme(prefersDarkMediaQuery.matches);

    const setDarkPaletteFromMediaQuery = (mediaQuery: MediaQueryListEvent) => {
      updateTheme(mediaQuery.matches);
    };

    prefersDarkMediaQuery.addEventListener(
      'change',
      setDarkPaletteFromMediaQuery,
    );
    return () => {
      prefersDarkMediaQuery.removeEventListener(
        'change',
        setDarkPaletteFromMediaQuery,
      );
    };
  }, [userPreferredTheme]);
};
