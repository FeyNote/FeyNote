import {
  AppPreferences,
  AppTheme,
  PreferenceNames,
  PreferencesSync,
  SupportedFontSize,
} from '@feynote/shared-utils';
import { trpc } from './trpc';
import { appIdbStorageManager } from './AppIdbStorageManager';
import { getRandomColor } from './getRandomColor';

const PREFERENCE_LOCALSTORAGE_KEY = 'preferences';

export class PreferencesService {
  // Preference defaults - user preferences loaded locally will override
  preferences: AppPreferences = {
    preferencesVersion: 0,

    [PreferenceNames.LeftPaneStartOpen]: true,
    [PreferenceNames.LeftPaneShowPinnedArtifacts]: true,
    [PreferenceNames.LeftPaneShowRecentArtifacts]: true,
    [PreferenceNames.LeftPaneShowRecentThreads]: true,
    [PreferenceNames.RightPaneStartOpen]: true,
    [PreferenceNames.Language]: null,
    [PreferenceNames.FontSize]: SupportedFontSize.X1_0,
    [PreferenceNames.Theme]: AppTheme.Default,
    [PreferenceNames.CollaborationColor]: getRandomColor(),
    [PreferenceNames.PreferencesSync]: PreferencesSync.Enabled,
  };
  initialLoading: Promise<void> | undefined;

  constructor() {}

  init() {
    if (!this.initialLoading) {
      this.initialLoading = this.load();
    }

    return this.initialLoading;
  }

  async save(localOnly?: boolean) {
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
    const session = await appIdbStorageManager.getSession();
    if (!session) return;
    await trpc.user.setPreferences.mutate(this.preferences).catch(() => {
      // Do nothing
    });
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

    // These are screen-size dependent and syncing these preferences would
    // cause issues on smaller devices
    delete mutatedPreferences[PreferenceNames.LeftPaneStartOpen];
    delete mutatedPreferences[PreferenceNames.RightPaneStartOpen];

    return mutatedPreferences;
  }

  async load() {
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
    const session = await appIdbStorageManager.getSession();
    if (!session) return;
    return trpc.user.getPreferences
      .query()
      .catch(() => {
        // Do nothing
      })
      .then(async (remotePreferences) => {
        if (remotePreferences) {
          const patchedPreferences = this.patchPreferences(remotePreferences);
          const filteredPreferences =
            this.filterRemotePreferences(patchedPreferences);
          Object.assign(this.preferences, filteredPreferences);

          // Persist remote preferences to localstorage (local only, do not cause another sync)
          await this.save(true);
        }
      });
  }
}
