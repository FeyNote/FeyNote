import { useMemo } from 'react';
import { PreferenceNames } from '@feynote/shared-utils';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import type { ShortcutName } from './KEYBOARD_SHORTCUTS';
import { getKeyboardShortcutEntryDisplayString } from './getKeyboardShortcutEntryDisplayString';

export const useKeyboardShortcutDisplay = (name: ShortcutName): string => {
  const { getPreference } = usePreferencesContext();
  const overrides = useMemo(
    () => getPreference(PreferenceNames.KeyboardShortcutOverrides),
    [getPreference],
  );

  return useMemo(
    () => getKeyboardShortcutEntryDisplayString(name, overrides),
    [name, overrides],
  );
};
