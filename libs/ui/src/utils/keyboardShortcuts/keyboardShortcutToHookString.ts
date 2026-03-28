import type { ShortcutDefinition } from './KEYBOARD_SHORTCUTS';

export const keyboardShortcutToHookString = (
  def: ShortcutDefinition,
): string => {
  const parts: string[] = [];
  if (def.mod) parts.push('mod');
  if (def.shift) parts.push('shift');
  if (def.alt) parts.push('alt');
  parts.push(def.key.toLowerCase());
  return parts.join('+');
};
