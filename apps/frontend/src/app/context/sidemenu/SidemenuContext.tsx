import { createContext } from 'react';

export interface SidemenuContextData {
  setContents: (content: React.ReactNode, paneId: string) => void;
  contents: React.ReactNode;
  sidemenuCurrentPaneId: string | undefined;
}

export const SidemenuContext = createContext<SidemenuContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  setContents: null as any,
  contents: null as any,
  sidemenuCurrentPaneId: null as any,
});
