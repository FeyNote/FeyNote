import { useCallback, useEffect, useMemo, useRef } from 'react';
import { KeyboardShortcutContext } from './KeyboardShortcutContext';
import type { ShortcutDefinition } from '../../utils/keyboardShortcuts';
import { matchesShortcut } from '../../utils/keyboardShortcuts';

interface Props {
  children: React.ReactNode;
}

type RegistryEntry = {
  shortcut: ShortcutDefinition;
  handler: () => void;
};

export const KeyboardShortcutContextProviderWrapper: React.FC<Props> = (
  props,
) => {
  const registryRef = useRef(new Map<string, RegistryEntry>());

  const registerShortcut = useCallback(
    (id: string, shortcut: ShortcutDefinition, handler: () => void) => {
      registryRef.current.set(id, { shortcut, handler });
    },
    [],
  );

  const unregisterShortcut = useCallback((id: string) => {
    registryRef.current.delete(id);
  }, []);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      for (const entry of registryRef.current.values()) {
        if (matchesShortcut(event, entry.shortcut)) {
          event.preventDefault();
          entry.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);

  const value = useMemo(
    () => ({ registerShortcut, unregisterShortcut }),
    [registerShortcut, unregisterShortcut],
  );

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {props.children}
    </KeyboardShortcutContext.Provider>
  );
};
