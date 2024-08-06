import { createContext } from 'react';
import { YManager } from '../../util/YManager';

export const YManagerContext = createContext({
  // We cast to unknown so that any usage of this context without initialization blows up in
  // catastrophic fashion
  yManager: null as unknown as YManager,
  onBeforeAuth: null as unknown as () => void,
});
