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
    let theme = AppTheme.Light;
    if (userPreferredTheme === AppTheme.Default && browserPrefersDark) {
      // User has no preference, respect navigator theme
      theme = AppTheme.Dark;
    } else {
      // Respect user preference for theme -- future theme support would go here
      theme = userPreferredTheme;
    }

    // Made it through with no preference, but we need to decide. Our default is light.
    if (theme === AppTheme.Default) {
      theme = AppTheme.Light;
    }

    document.documentElement.classList.toggle(
      'ion-palette-light',
      theme === AppTheme.Light,
    );
    document.documentElement.classList.toggle(
      'light',
      theme === AppTheme.Light,
    );
    document.documentElement.classList.toggle(
      'ion-palette-dark',
      theme === AppTheme.Dark,
    );
    document.documentElement.classList.toggle(
      'dark',
      theme === AppTheme.Dark,
    );
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
