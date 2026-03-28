import {
  isMac as getIsMac,
  MAC_SYMBOLS,
} from '../../components/editor/tiptap/extensions/tiptap-ui/tiptap-utils';
import type { ShortcutDefinition } from './KEYBOARD_SHORTCUTS';

const KEY_DISPLAY_NAMES: Record<string, string> = {
  arrowright: '→',
  arrowleft: '←',
  arrowup: '↑',
  arrowdown: '↓',
  tab: 'Tab',
  enter: '↵',
  backspace: '⌫',
  delete: 'Del',
  escape: 'Esc',
};

export const getKeyboardShortcutDisplayString = (
  def: ShortcutDefinition,
): string => {
  const isMac = getIsMac();
  const parts: string[] = [];

  if (def.mod) {
    parts.push(isMac ? MAC_SYMBOLS['mod'] : 'Ctrl');
  }
  if (def.shift) {
    parts.push(isMac ? MAC_SYMBOLS['shift'] : 'Shift');
  }
  if (def.alt) {
    parts.push(isMac ? MAC_SYMBOLS['alt'] : 'Alt');
  }

  const lower = def.key.toLowerCase();
  const displayName = KEY_DISPLAY_NAMES[lower];
  const keyDisplay = displayName
    ? displayName
    : def.key.length === 1
      ? def.key.toUpperCase()
      : def.key;
  parts.push(keyDisplay);

  return isMac ? parts.join('') : parts.join('+');
};
