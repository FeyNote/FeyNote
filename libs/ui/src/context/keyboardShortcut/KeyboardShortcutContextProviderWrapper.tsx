import { useCallback, useEffect, useMemo, useRef } from 'react';
import { KeyboardShortcutContext } from './KeyboardShortcutContext';
import type { ShortcutDefinition } from '../../utils/keyboardShortcuts';
import { keyboardShortcutToHookString } from '../../utils/keyboardShortcuts';
import { keyboardEventToShortcutDefinition } from '../../utils/keyboardShortcuts/keyboardEventToShortcutDefinition';

interface Props {
  children: React.ReactNode;
}

type Handler = () => boolean;

export const KeyboardShortcutContextProviderWrapper: React.FC<Props> = (
  props,
) => {
  const registryRef = useRef(new Map<string, Set<Handler>>());

  const registerShortcut = useCallback(
    (shortcut: ShortcutDefinition, handler: Handler) => {
      const key = keyboardShortcutToHookString(shortcut);
      let handlers = registryRef.current.get(key);
      if (!handlers) {
        handlers = new Set();
        registryRef.current.set(key, handlers);
      }
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
        if (handlers.size === 0) {
          registryRef.current.delete(key);
        }
      };
    },
    [],
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const key = keyboardShortcutToHookString(
        keyboardEventToShortcutDefinition(event),
      );
      const handlers = registryRef.current.get(key);
      if (!handlers) return;

      for (const handler of handlers) {
        if (!handler()) continue;
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);

  const value = useMemo(() => ({ registerShortcut }), [registerShortcut]);

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {props.children}
    </KeyboardShortcutContext.Provider>
  );
};
