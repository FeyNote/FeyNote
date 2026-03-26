import type { KeyboardShortcutOverride } from '@feynote/shared-utils';
import {
  type ShortcutDefinition,
  type ShortcutName,
  KEYBOARD_SHORTCUTS,
} from './KEYBOARD_SHORTCUTS';
import { getPlatformKeyboardShortcut } from './getPlatformKeyboardShortcut';

export const resolveKeyboardShortcut = (
  name: ShortcutName,
  overrides: Record<string, KeyboardShortcutOverride>,
): ShortcutDefinition | null => {
  const override = overrides[name];
  if (override) return override;
  return getPlatformKeyboardShortcut(KEYBOARD_SHORTCUTS[name].default);
};
