import { createContext } from 'react';

export interface SidemenuContextData {
  sidemenuContentRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const SidemenuContext = createContext<SidemenuContextData>({
  sidemenuContentRef: {
    current: null,
  },
});
