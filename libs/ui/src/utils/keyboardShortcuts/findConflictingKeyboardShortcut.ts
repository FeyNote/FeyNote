import type { KeyboardShortcutOverride } from '@feynote/shared-utils';
import {
  type ShortcutDefinition,
  type ShortcutName,
  KEYBOARD_SHORTCUTS,
} from './KEYBOARD_SHORTCUTS';
import { keyboardShortcutToHookString } from './keyboardShortcutToHookString';
import { resolveKeyboardShortcut } from './resolveKeyboardShortcut';

export const findConflictingKeyboardShortcut = (
  candidate: ShortcutDefinition,
  overrides: Record<string, KeyboardShortcutOverride>,
  excludeId: string,
): { id: ShortcutName; label: string } | null => {
  const candidateStr = keyboardShortcutToHookString(candidate);
  for (const name of Object.keys(KEYBOARD_SHORTCUTS) as ShortcutName[]) {
    if (name === excludeId) continue;
    if (!KEYBOARD_SHORTCUTS[name].customizable) continue;
    const resolved = resolveKeyboardShortcut(name, overrides);
    if (resolved && keyboardShortcutToHookString(resolved) === candidateStr) {
      return { id: name, label: KEYBOARD_SHORTCUTS[name].label };
    }
  }
  return null;
};
