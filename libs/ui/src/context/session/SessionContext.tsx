import type { SessionDTO } from '@feynote/shared-utils';
import { createContext, useContext } from 'react';

export interface SessionContextData {
  session: SessionDTO;
  setSession: (session: SessionDTO | null) => Promise<void>;
}

export const SessionContext = createContext<SessionContextData>({
  session: null as unknown as SessionContextData['session'],
  setSession: null as unknown as SessionContextData['setSession'],
});

// TODO: Remove the default psuedo-value above and replace all useContext(SessionContext) with this.
export function useSessionContext(): SessionContextData;
export function useSessionContext(optional: true): SessionContextData | undefined;
export function useSessionContext(optional?: true): SessionContextData {
  const context = useContext(SessionContext);

  if ((!context || !context.session) && !optional) {
    throw new Error("Session used in component where session was not available!");
  }

  return context;
}
