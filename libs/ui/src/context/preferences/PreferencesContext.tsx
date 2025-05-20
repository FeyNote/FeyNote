import { createContext, useContext } from 'react';
import { AppPreferences, PreferenceNames } from '@feynote/shared-utils';
import { PreferencesService } from '../../utils/preferences';

export type GetPreferenceHandler = <T extends PreferenceNames>(
  preference: T,
) => AppPreferences[T];
export type SetPreferenceHandler = <T extends PreferenceNames>(
  preference: T,
  value: AppPreferences[T],
) => void;

interface PreferencesContextData {
  setPreference: SetPreferenceHandler;
  getPreference: GetPreferenceHandler;
  _preferencesService: PreferencesService;
  _rerenderReducerValue: number;
}

export const PreferencesContext = createContext<PreferencesContextData>(
  // Purposefully make this an invalid type, since we don't want to initialize here (we do so in wrapper)
  // and we don't want to provide a partial implementation that might not throw an error if used improperly
  null as unknown as PreferencesContextData,
);

export const usePreferencesContext = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      'usePreferencesContext must be used within a PreferencesContext.Provider',
    );
  }
  return context;
};
