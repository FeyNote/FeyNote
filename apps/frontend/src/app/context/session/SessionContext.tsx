import type { SessionDTO } from '@feynote/shared-utils';
import { createContext } from 'react';

export const SessionContext = createContext<{
  session: SessionDTO | null;
  setSession: (session: SessionDTO | null) => Promise<void>;
}>({
  session: null,
  setSession: null as any,
});
