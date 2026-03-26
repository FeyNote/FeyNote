import type { KeyboardShortcutOverride } from '@feynote/shared-utils';
import {
  type ShortcutEntry,
  type ShortcutName,
  KEYBOARD_SHORTCUTS,
} from './KEYBOARD_SHORTCUTS';
import { getKeyboardShortcutDisplayString } from './getKeyboardShortcutDisplayString';
import { isKeyboardShortcutDualVariant } from './isKeyboardShortcutDualVariant';

export const getKeyboardShortcutEntryDisplayString = (
  name: ShortcutName,
  overrides: Record<string, KeyboardShortcutOverride>,
): string => {
  const override = overrides[name];
  if (override) return getKeyboardShortcutDisplayString(override);
  const defaultDef: ShortcutEntry['default'] = KEYBOARD_SHORTCUTS[name].default;
  if (defaultDef === null) return '';
  if (isKeyboardShortcutDualVariant(defaultDef)) {
    const nativeStr = getKeyboardShortcutDisplayString(defaultDef.native);
    const browserStr = getKeyboardShortcutDisplayString(defaultDef.browser);
    return nativeStr === browserStr
      ? nativeStr
      : `${nativeStr} / ${browserStr}`;
  }
  return getKeyboardShortcutDisplayString(defaultDef);
};
