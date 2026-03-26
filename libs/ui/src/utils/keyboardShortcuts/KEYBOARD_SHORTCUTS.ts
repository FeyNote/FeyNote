export type ShortcutDefinition = {
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
};

export type ShortcutCategory = 'global' | 'document' | 'textDocument';

export type ShortcutEntry = {
  label: string;
  category: ShortcutCategory;
  customizable: boolean;
  default:
    | ShortcutDefinition
    | { native: ShortcutDefinition; browser: ShortcutDefinition }
    | null;
};

export const KEYBOARD_SHORTCUTS = {
  splitRight: {
    label: 'settings.keyboardShortcuts.shortcut.splitRight',
    category: 'global',
    customizable: true,
    default: {
      native: { mod: true, alt: true, key: 'ArrowRight' },
      browser: { mod: true, shift: true, alt: true, key: 'ArrowRight' },
    },
  },
  splitDown: {
    label: 'settings.keyboardShortcuts.shortcut.splitDown',
    category: 'global',
    customizable: true,
    default: {
      native: { mod: true, alt: true, key: 'ArrowDown' },
      browser: { mod: true, shift: true, alt: true, key: 'ArrowDown' },
    },
  },
  newDocument: {
    label: 'settings.keyboardShortcuts.shortcut.newDocument',
    category: 'global',
    customizable: true,
    default: {
      native: { mod: true, key: 'n' },
      browser: { mod: true, alt: true, key: 'n' },
    },
  },
  newTab: {
    label: 'settings.keyboardShortcuts.shortcut.newTab',
    category: 'global',
    customizable: true,
    default: {
      native: { mod: true, key: 't' },
      browser: { mod: true, alt: true, key: 't' },
    },
  },
  closeTab: {
    label: 'settings.keyboardShortcuts.shortcut.closeTab',
    category: 'global',
    customizable: true,
    default: {
      native: { mod: true, key: 'w' },
      browser: { mod: true, alt: true, key: 'w' },
    },
  },
  print: {
    label: 'settings.keyboardShortcuts.shortcut.print',
    category: 'global',
    customizable: true,
    default: { mod: true, key: 'p' },
  },
  toggleLeftMenu: {
    label: 'settings.keyboardShortcuts.shortcut.toggleLeftMenu',
    category: 'global',
    customizable: true,
    default: { mod: true, key: '\\' },
  },
  toggleRightMenu: {
    label: 'settings.keyboardShortcuts.shortcut.toggleRightMenu',
    category: 'global',
    customizable: true,
    default: { mod: true, shift: true, key: '\\' },
  },
  search: {
    label: 'settings.keyboardShortcuts.shortcut.search',
    category: 'global',
    customizable: true,
    default: { mod: true, key: 'k' },
  },
  link: {
    label: 'settings.keyboardShortcuts.shortcut.link',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: 'k' },
  },
  newDocumentWithin: {
    label: 'settings.keyboardShortcuts.shortcut.newDocumentWithin',
    category: 'document',
    customizable: true,
    default: null,
  },
  duplicate: {
    label: 'settings.keyboardShortcuts.shortcut.duplicate',
    category: 'document',
    customizable: true,
    default: null,
  },
  insertHorizontalRule: {
    label: 'settings.keyboardShortcuts.shortcut.insertHorizontalRule',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertTable: {
    label: 'settings.keyboardShortcuts.shortcut.insertTable',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertMonsterStatblock: {
    label: 'settings.keyboardShortcuts.shortcut.insertMonsterStatblock',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertWideMonsterStatblock: {
    label: 'settings.keyboardShortcuts.shortcut.insertWideMonsterStatblock',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertSpellSheet: {
    label: 'settings.keyboardShortcuts.shortcut.insertSpellSheet',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertNote: {
    label: 'settings.keyboardShortcuts.shortcut.insertNote',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertAutoFormatText: {
    label: 'settings.keyboardShortcuts.shortcut.insertAutoFormatText',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  insertFile: {
    label: 'settings.keyboardShortcuts.shortcut.insertFile',
    category: 'textDocument',
    customizable: true,
    default: null,
  },
  bold: {
    label: 'settings.keyboardShortcuts.shortcut.bold',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'b' },
  },
  italic: {
    label: 'settings.keyboardShortcuts.shortcut.italic',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'i' },
  },
  underline: {
    label: 'settings.keyboardShortcuts.shortcut.underline',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'u' },
  },
  strikethrough: {
    label: 'settings.keyboardShortcuts.shortcut.strikethrough',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: 'x' },
  },
  alignLeft: {
    label: 'settings.keyboardShortcuts.shortcut.alignLeft',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: 'l' },
  },
  alignCenter: {
    label: 'settings.keyboardShortcuts.shortcut.alignCenter',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: 'e' },
  },
  alignRight: {
    label: 'settings.keyboardShortcuts.shortcut.alignRight',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: 'r' },
  },
  h1: {
    label: 'settings.keyboardShortcuts.shortcut.h1',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, alt: true, key: '1' },
  },
  h2: {
    label: 'settings.keyboardShortcuts.shortcut.h2',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, alt: true, key: '2' },
  },
  h3: {
    label: 'settings.keyboardShortcuts.shortcut.h3',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, alt: true, key: '3' },
  },
  h4: {
    label: 'settings.keyboardShortcuts.shortcut.h4',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, alt: true, key: '4' },
  },
  h5: {
    label: 'settings.keyboardShortcuts.shortcut.h5',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, alt: true, key: '5' },
  },
  h6: {
    label: 'settings.keyboardShortcuts.shortcut.h6',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, alt: true, key: '6' },
  },
  bulletList: {
    label: 'settings.keyboardShortcuts.shortcut.bulletList',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: '8' },
  },
  orderedList: {
    label: 'settings.keyboardShortcuts.shortcut.orderedList',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: '7' },
  },
  taskList: {
    label: 'settings.keyboardShortcuts.shortcut.taskList',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: '9' },
  },
  indent: {
    label: 'settings.keyboardShortcuts.shortcut.indent',
    category: 'textDocument',
    customizable: false,
    default: { key: 'Tab' },
  },
  outdent: {
    label: 'settings.keyboardShortcuts.shortcut.outdent',
    category: 'textDocument',
    customizable: false,
    default: { shift: true, key: 'Tab' },
  },
  undo: {
    label: 'settings.keyboardShortcuts.shortcut.undo',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'z' },
  },
  redo: {
    label: 'settings.keyboardShortcuts.shortcut.redo',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, shift: true, key: 'z' },
  },
  cut: {
    label: 'settings.keyboardShortcuts.shortcut.cut',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'x' },
  },
  copy: {
    label: 'settings.keyboardShortcuts.shortcut.copy',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'c' },
  },
  selectAll: {
    label: 'settings.keyboardShortcuts.shortcut.selectAll',
    category: 'textDocument',
    customizable: false,
    default: { mod: true, key: 'a' },
  },
  delete: {
    label: 'settings.keyboardShortcuts.shortcut.delete',
    category: 'textDocument',
    customizable: false,
    default: { key: 'delete' },
  },
} as const satisfies Record<string, ShortcutEntry>;

export type ShortcutName = keyof typeof KEYBOARD_SHORTCUTS;
