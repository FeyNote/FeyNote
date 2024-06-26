import i18next from 'i18next';
import { detectLanguage } from '../app/i18n/detectLanguage';
import {
  AppPreferences,
  AppTheme,
  PreferenceNames,
  PreferencesSync,
  SupportedFontSize,
} from '@feynote/shared-utils';
import { setFontSize } from './setFontSize';
import { trpc } from './trpc';
import { setBrowserLanguage } from '../app/i18n/setBrowserLanguage';
import { setAppTheme } from './setAppTheme';
import { SESSION_ITEM_NAME } from '../app/context/session/types';

const PREFERENCE_LOCALSTORAGE_KEY = 'preferences';

export class PreferencesService {
  // Preference defaults - user preferences loaded locally will override
  preferences: AppPreferences = {
    preferencesVersion: 0,

    [PreferenceNames.EnableSplitPane]: true,
    [PreferenceNames.Language]: null,
    [PreferenceNames.FontSize]: SupportedFontSize.X1_0,
    [PreferenceNames.Theme]: AppTheme.Default,
    [PreferenceNames.PreferencesSync]: PreferencesSync.Enabled,
  };

  constructor() {
    this.load();
  }

  save(localOnly?: boolean) {
    try {
      const serialized = JSON.stringify(this.preferences);
      localStorage.setItem(PREFERENCE_LOCALSTORAGE_KEY, serialized);
    } catch (e) {
      console.error(e);
    }

    if (localOnly) return;
    if (
      this.preferences[PreferenceNames.PreferencesSync] !==
      PreferencesSync.Enabled
    )
      return;

    // Do not sync remote preferences if not logged in
    if (!localStorage.getItem(SESSION_ITEM_NAME)) return;
    trpc.user.setPreferences.mutate(this.preferences);
  }

  /**
   * Responsible for taking care of updates between preferences versions
   */
  private patchPreferences(preferences: AppPreferences) {
    const mutatedPreferences = {
      ...preferences,
    };

    // A place to patch legacy preference versions with updated versions.

    return mutatedPreferences;
  }

  /**
   * Intended to be used to filter incoming preferences from the server
   * In order to have preferences that are local-only
   */
  private filterRemotePreferences(preferences: AppPreferences) {
    const mutatedPreferences = {
      ...preferences,
    } as Partial<AppPreferences>;

    // We do not want to sync preferencesSync itself since that would cause issues with the user setting a local value to disable this feature
    delete mutatedPreferences[PreferenceNames.PreferencesSync];

    return mutatedPreferences;
  }

  load() {
    try {
      const serialized = localStorage.getItem(PREFERENCE_LOCALSTORAGE_KEY);
      const savedPreferences = serialized ? JSON.parse(serialized) || {} : {};

      const patchedPreferences = this.patchPreferences(savedPreferences);

      Object.assign(this.preferences, patchedPreferences);
    } catch (e) {
      console.error(e);
    }

    if (
      this.preferences[PreferenceNames.PreferencesSync] !==
      PreferencesSync.Enabled
    )
      return;

    // Do not sync remote preferences if not logged in
    if (!localStorage.getItem(SESSION_ITEM_NAME)) return;
    trpc.user.getPreferences
      .query()
      .catch(() => {
        // Do nothing
      })
      .then((remotePreferences) => {
        if (remotePreferences) {
          const patchedPreferences = this.patchPreferences(remotePreferences);
          const filteredPreferences =
            this.filterRemotePreferences(patchedPreferences);

          const previousLanguagePref =
            this.preferences[PreferenceNames.Language];
          const previousTheme = this.preferences[PreferenceNames.Theme];
          Object.assign(this.preferences, filteredPreferences);

          this.save(true);

          setFontSize(this.preferences[PreferenceNames.FontSize]);

          const language =
            this.preferences[PreferenceNames.Language] || detectLanguage();
          if (
            previousLanguagePref !== this.preferences[PreferenceNames.Language]
          ) {
            i18next.changeLanguage(language);
            setBrowserLanguage(language);
          }

          if (previousTheme !== this.preferences[PreferenceNames.Theme]) {
            setAppTheme(this.preferences[PreferenceNames.Theme]);
          }
        }
      });
  }
}
