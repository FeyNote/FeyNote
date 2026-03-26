import { useEffect, useRef } from 'react';
import type { ShortcutDefinition } from './KEYBOARD_SHORTCUTS';
import { keyboardShortcutToHookString } from './keyboardShortcutToHookString';
import { useKeyboardShortcutContext } from '../../context/keyboardShortcut/KeyboardShortcutContext';

export const useRegisterKeyboardShortcutHandler = (
  shortcut: ShortcutDefinition | ShortcutDefinition[],
  handler: () => boolean,
) => {
  const { registerShortcut } = useKeyboardShortcutContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const shortcutKey = (Array.isArray(shortcut) ? shortcut : [shortcut])
    .map(keyboardShortcutToHookString)
    .join('|');

  useEffect(() => {
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
    const stableHandler = () => handlerRef.current();

    const cleanups = shortcuts.map((s) => registerShortcut(s, stableHandler));

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [shortcutKey, registerShortcut]);
};
