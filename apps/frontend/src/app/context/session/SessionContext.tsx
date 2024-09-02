import type { SessionDTO } from '@feynote/shared-utils';
import { createContext } from 'react';

export interface SessionContextData {
  session: SessionDTO;
  setSession: (session: SessionDTO | null) => Promise<void>;
}

export const SessionContext = createContext<SessionContextData>({
  session: null as any,
  setSession: null as any,
});
