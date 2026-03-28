import { getIsElectron } from '../getIsElectron';
import type { ShortcutDefinition } from './KEYBOARD_SHORTCUTS';
import { isKeyboardShortcutDualVariant } from './isKeyboardShortcutDualVariant';

export const getPlatformKeyboardShortcut = (
  def:
    | ShortcutDefinition
    | { native: ShortcutDefinition; browser: ShortcutDefinition }
    | null,
): ShortcutDefinition | null => {
  if (def === null) return null;
  if (isKeyboardShortcutDualVariant(def)) {
    return getIsElectron() ? def.native : def.browser;
  }
  return def;
};
