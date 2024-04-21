import { createContext } from 'react';
import { SESSION_ITEM_NAME } from './types';

export const SessionContext = createContext({
  session: localStorage.getItem(SESSION_ITEM_NAME),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSession: (_: string | null) => {},
});
