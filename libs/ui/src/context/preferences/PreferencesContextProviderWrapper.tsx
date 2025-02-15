import { ReactNode, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  GetPreferenceHandler,
  PreferencesContext,
  SetPreferenceHandler,
} from './PreferencesContext';
import { PreferencesService } from '../../utils/preferences';
import { useAppThemeWatcher } from '../../utils/useAppThemeWatcher';
import { useAppFontSizeWatcher } from '../../utils/useAppFontSizeWatcher';
import { useAppLanguageWatcher } from '../../utils/useAppLanguageWatcher';

interface Props {
  children: ReactNode;
}

const preferencesService = new PreferencesService();

export const PreferencesContextProviderWrapper: React.FC<Props> = ({
  children,
}) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const gotInitialLoadEvent = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (!gotInitialLoadEvent.current) {
      // I hate react sometimes
      preferencesService.init().then(() => {
        if (!gotInitialLoadEvent.current && isMounted) {
          triggerRerender();
          gotInitialLoadEvent.current = true;
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useAppThemeWatcher(preferencesService.preferences);
  useAppFontSizeWatcher(preferencesService.preferences);
  useAppLanguageWatcher(preferencesService.preferences);

  const setPreference: SetPreferenceHandler = (preference, value) => {
    preferencesService.preferences[preference] = value;
    preferencesService.save();

    triggerRerender();
  };

  const getPreference: GetPreferenceHandler = (preference) => {
    return preferencesService.preferences[preference];
  };

  const contextValue = useMemo(
    () => ({
      getPreference,
      setPreference,
      _preferencesService: preferencesService,
      _rerenderReducerValue,
    }),
    [_rerenderReducerValue],
  );

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};
