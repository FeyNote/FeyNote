import { createContext } from 'react';
import { SESSION_ITEM_NAME } from './types';
import { Token } from '@feynote/shared-utils';

export const SessionContext = createContext({
  session: JSON.parse(localStorage.getItem(SESSION_ITEM_NAME) || "null") as Token | null,
  setSession: (_: Token): void => {
    throw new Error("CRITICAL: SessionContext not initialized");
  },
});
