import { createContext } from 'react';
import { AppPreferences, PreferenceNames } from '@feynote/shared-utils';
import { PreferencesService } from '../../utils/preferences';

export type GetPreferenceHandler = <T extends PreferenceNames>(
  preference: T,
) => AppPreferences[T];
export type SetPreferenceHandler = <T extends PreferenceNames>(
  preference: T,
  value: AppPreferences[T],
) => void;

export const PreferencesContext = createContext<{
  setPreference: SetPreferenceHandler;
  getPreference: GetPreferenceHandler;
  _preferencesService: PreferencesService;
  _rerenderReducerValue: number;
}>(
  // Purposefully make this an invalid type, since we don't want to initialize here (we do so in wrapper)
  // and we don't want to provide a partial implementation that might not throw an error if used improperly
  null as any,
);
