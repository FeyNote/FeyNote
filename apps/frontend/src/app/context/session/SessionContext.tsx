import { createContext } from 'react';
import { SESSION_ITEM_NAME } from './types';

export const SessionContext = createContext({
  session: localStorage.getItem(SESSION_ITEM_NAME),
  setSession: (_: string | null) => {
    // Placeholder
  },
});
