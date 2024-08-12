import { createContext } from 'react';

export const GlobalSearchContext = createContext({
  // We cast to unknown so that any usage of this context without initialization blows up in
  // catastrophic fashion
  trigger: null as unknown as () => void,
});
