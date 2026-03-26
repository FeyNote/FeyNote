import { createContext, useContext } from 'react';
import type { ShortcutDefinition } from '../../utils/keyboardShortcuts';

export interface KeyboardShortcutContextData {
  registerShortcut: (
    shortcut: ShortcutDefinition,
    handler: () => boolean,
  ) => () => void;
}

export const KeyboardShortcutContext =
  createContext<KeyboardShortcutContextData | null>(null);

export const useKeyboardShortcutContext = () => {
  const val = useContext(KeyboardShortcutContext);

  if (!val) {
    throw new Error(
      'KeyboardShortcutContext used within component that does not inherit from KeyboardShortcutContextProviderWrapper',
    );
  }

  return val;
};
