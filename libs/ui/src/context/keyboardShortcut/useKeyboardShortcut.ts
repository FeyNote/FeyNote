import { useEffect, useRef } from 'react';
import type { ShortcutDefinition } from '../../utils/keyboardShortcuts';
import { shortcutToHookString } from '../../utils/keyboardShortcuts';
import { useKeyboardShortcutContext } from './KeyboardShortcutContext';

export const useRegisterKeyboardShortcutHandler = (
  id: string,
  shortcut: ShortcutDefinition | ShortcutDefinition[],
  handler: () => void,
) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const shortcutKey = (Array.isArray(shortcut) ? shortcut : [shortcut])
    .map(shortcutToHookString)
    .join('|');

  useEffect(() => {
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
    const stableHandler = () => handlerRef.current();

    shortcuts.forEach((s, index) => {
      const registrationId = shortcuts.length > 1 ? `${id}:${index}` : id;
      registerShortcut(registrationId, s, stableHandler);
    });

    return () => {
      shortcuts.forEach((_, index) => {
        const registrationId = shortcuts.length > 1 ? `${id}:${index}` : id;
        unregisterShortcut(registrationId);
      });
    };
  }, [id, shortcutKey, registerShortcut, unregisterShortcut]);
};
