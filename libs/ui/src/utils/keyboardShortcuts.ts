import {
  isMac as getIsMac,
  MAC_SYMBOLS,
} from '../components/editor/tiptap/extensions/tiptap-ui/tiptap-utils';
import { getIsElectron } from './getIsElectron';

export type ShortcutDefinition = {
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
};

export const APP_KEYBOARD_SHORTCUTS = {
  splitRight: {
    native: { mod: true, alt: true, key: 'ArrowRight' },
    browser: { mod: true, shift: true, alt: true, key: 'ArrowRight' },
  },
  splitDown: {
    native: { mod: true, alt: true, key: 'ArrowDown' },
    browser: { mod: true, shift: true, alt: true, key: 'ArrowDown' },
  },
  newDocument: {
    native: { mod: true, key: 'n' },
    browser: { mod: true, alt: true, key: 'n' },
  },
  newTab: {
    native: { mod: true, key: 't' },
    browser: { mod: true, alt: true, key: 't' },
  },
  closeTab: {
    native: { mod: true, key: 'w' },
    browser: { mod: true, alt: true, key: 'w' },
  },
  print: { mod: true, key: 'p' },
  toggleLeftMenu: { mod: true, key: '\\' },
  toggleRightMenu: { mod: true, shift: true, key: '\\' },
  search: { mod: true, key: 'k' },
  link: { mod: true, shift: true, key: 'k' },
  bold: { mod: true, key: 'b' },
  italic: { mod: true, key: 'i' },
  underline: { mod: true, key: 'u' },
  strikethrough: { mod: true, shift: true, key: 'x' },
  alignLeft: { mod: true, shift: true, key: 'l' },
  alignCenter: { mod: true, shift: true, key: 'e' },
  alignRight: { mod: true, shift: true, key: 'r' },
  h1: { mod: true, alt: true, key: '1' },
  h2: { mod: true, alt: true, key: '2' },
  h3: { mod: true, alt: true, key: '3' },
  h4: { mod: true, alt: true, key: '4' },
  h5: { mod: true, alt: true, key: '5' },
  h6: { mod: true, alt: true, key: '6' },
  bulletList: { mod: true, shift: true, key: '8' },
  orderedList: { mod: true, shift: true, key: '7' },
  taskList: { mod: true, shift: true, key: '9' },
  indent: { key: 'Tab' },
  outdent: { shift: true, key: 'Tab' },
  undo: { mod: true, key: 'z' },
  redo: { mod: true, shift: true, key: 'z' },
  cut: { mod: true, key: 'x' },
  copy: { mod: true, key: 'c' },
  selectAll: { mod: true, key: 'a' },
  delete: { key: 'delete' },
} as const satisfies Record<
  string,
  | ShortcutDefinition
  | { native: ShortcutDefinition; browser: ShortcutDefinition }
>;

/**
 * Converts a shortcut definition to a simple string.
 * Useful for a hook memoization prop but should not be used in UI
 */
export const shortcutToHookString = (def: ShortcutDefinition): string => {
  const parts: string[] = [];
  if (def.mod) parts.push('mod');
  if (def.shift) parts.push('shift');
  if (def.alt) parts.push('alt');
  parts.push(def.key.toLowerCase());
  return parts.join('+');
};

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

/**
 * Used for alt-prefaced keypresses which need key.code due to it being MacOS's dead key
 */
const keyToCode = (key: string): string | undefined => {
  const upper = key.toUpperCase();
  if (upper.length === 1 && upper >= 'A' && upper <= 'Z') return `Key${upper}`;
  if (upper.length === 1 && upper >= '0' && upper <= '9')
    return `Digit${upper}`;
  return undefined;
};

export const matchesShortcut = (
  event: KeyboardEvent,
  def: ShortcutDefinition,
): boolean => {
  const isModActive = getIsMac() ? event.metaKey : event.ctrlKey;
  const modMatch = !!def.mod === isModActive;
  const shiftMatch = !!def.shift === event.shiftKey;
  const altMatch = !!def.alt === event.altKey;

  let keyMatch: boolean;
  if (def.alt) {
    const code = keyToCode(def.key);
    keyMatch = code
      ? event.code === code
      : event.key.toLowerCase() === def.key.toLowerCase();
  } else {
    keyMatch = event.key.toLowerCase() === def.key.toLowerCase();
  }

  return modMatch && shiftMatch && altMatch && keyMatch;
};

export const getShortcutDisplayString = (def: ShortcutDefinition): string => {
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

export const getDesktopBrowserShortcutDisplayString = (
  nativeDef: ShortcutDefinition,
  browserDef: ShortcutDefinition,
): string => {
  return getShortcutDisplayString(getIsElectron() ? nativeDef : browserDef);
};
