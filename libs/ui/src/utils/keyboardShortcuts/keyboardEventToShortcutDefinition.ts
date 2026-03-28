import { isMac as getIsMac } from '../../components/editor/tiptap/extensions/tiptap-ui/tiptap-utils';
import type { ShortcutDefinition } from './KEYBOARD_SHORTCUTS';

const codeToKey = (code: string): string | undefined => {
  if (code.startsWith('Key') && code.length === 4) return code[3].toLowerCase();
  if (code.startsWith('Digit') && code.length === 6) return code[5];
  return undefined;
};

export const keyboardEventToShortcutDefinition = (
  event: KeyboardEvent,
): ShortcutDefinition => {
  const isMac = getIsMac();
  const mod = isMac ? event.metaKey : event.ctrlKey;

  const key =
    event.altKey && event.code
      ? (codeToKey(event.code) ?? event.key.toLowerCase())
      : event.key.toLowerCase();

  const def: ShortcutDefinition = { key };
  if (mod) def.mod = true;
  if (event.shiftKey) def.shift = true;
  if (event.altKey) def.alt = true;
  return def;
};
