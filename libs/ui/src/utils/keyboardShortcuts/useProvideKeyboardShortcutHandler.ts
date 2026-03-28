import { useMemo } from 'react';
import { PreferenceNames } from '@feynote/shared-utils';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useRegisterKeyboardShortcutHandler } from './useRegisterKeyboardShortcutHandler';
import type { ShortcutName } from './KEYBOARD_SHORTCUTS';
import { getKeyboardShortcutEntryDisplayString } from './getKeyboardShortcutEntryDisplayString';
import { resolveKeyboardShortcutDefinitions } from './resolveKeyboardShortcutDefinitions';

export const useProvideKeyboardShortcutHandler = (
  name: ShortcutName,
  handler: () => boolean,
): { displayString: string; isCustomized: boolean } => {
  const { getPreference } = usePreferencesContext();

  const overrides = useMemo(
    () => getPreference(PreferenceNames.KeyboardShortcutOverrides),
    [getPreference],
  );

  const definitions = useMemo(
    () => resolveKeyboardShortcutDefinitions(name, overrides),
    [name, overrides],
  );

  useRegisterKeyboardShortcutHandler(definitions ?? [], handler);

  return useMemo(
    () => ({
      displayString: getKeyboardShortcutEntryDisplayString(name, overrides),
      isCustomized: name in overrides,
    }),
    [name, overrides],
  );
};
