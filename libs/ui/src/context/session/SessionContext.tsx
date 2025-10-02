import type { SessionDTO } from '@feynote/shared-utils';
import { createContext, useContext } from 'react';

export interface SessionContextData {
  session: SessionDTO;
  setSession: (session: SessionDTO | null) => Promise<void>;
}

export const SessionContext = createContext<SessionContextData | null>(null);

export function useSessionContext(): SessionContextData;
export function useSessionContext(optional: true): SessionContextData | null;
export function useSessionContext(optional?: true): SessionContextData | null {
  const context = useContext(SessionContext);

  if (!context && !optional) {
    throw new Error(
      'Session used in component where session context was not provided!',
    );
  }

  return context;
}
