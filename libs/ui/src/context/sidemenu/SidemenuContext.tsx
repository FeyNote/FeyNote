import { createContext, useContext } from 'react';

export interface SidemenuContextData {
  sidemenuContentRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const SidemenuContext = createContext<SidemenuContextData>({
  sidemenuContentRef: {
    current: null,
  },
});

export const useSidemenuContext = () => {
  return useContext(SidemenuContext);
};
