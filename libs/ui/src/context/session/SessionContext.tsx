import type { SessionDTO } from '@feynote/shared-utils';
import { createContext, useContext } from 'react';

export interface SessionContextData {
  session: SessionDTO;
  setSession: (session: SessionDTO | null) => Promise<void>;
}

export const SessionContext = createContext<SessionContextData | undefined>(
  undefined,
);

export function useSessionContext(): SessionContextData;
export function useSessionContext(
  optional: true,
): SessionContextData | undefined;
export function useSessionContext(
  optional?: true,
): SessionContextData | undefined {
  const context = useContext(SessionContext);

  if (!context && !optional) {
    throw new Error(
      'Session used in component where session context was not provided!',
    );
  }

  return context;
}
