import type { ShortcutDefinition } from './KEYBOARD_SHORTCUTS';

export const isKeyboardShortcutDualVariant = (
  def:
    | ShortcutDefinition
    | { native: ShortcutDefinition; browser: ShortcutDefinition }
    | null,
): def is { native: ShortcutDefinition; browser: ShortcutDefinition } => {
  return def !== null && 'native' in def;
};
