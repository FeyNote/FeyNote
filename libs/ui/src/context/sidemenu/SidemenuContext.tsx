import { createContext } from 'react';

export interface SidemenuContextData {
  sidemenuContentRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const SidemenuContext = createContext<SidemenuContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  sidemenuContentRef: null as any,
});
