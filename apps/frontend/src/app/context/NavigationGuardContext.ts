import { createContext } from 'react';

export const NavigationGuardContext = createContext({
  setNavigationGuardMessage: (message: string | undefined) => {
    console.log(message);
  },
});
