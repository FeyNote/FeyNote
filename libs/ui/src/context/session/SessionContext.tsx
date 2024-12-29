import type { SessionDTO } from '@feynote/shared-utils';
import { createContext } from 'react';

export interface SessionContextData {
  session: SessionDTO;
  setSession: (session: SessionDTO | null) => Promise<void>;
}

export const SessionContext = createContext<SessionContextData>({
  session: null as unknown as SessionContextData['session'],
  setSession: null as unknown as SessionContextData['setSession'],
});
