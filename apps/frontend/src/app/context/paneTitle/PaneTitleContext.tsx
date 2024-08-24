import { createContext } from 'react';

interface PaneTitleContextData {
  getPaneTitle: (paneId: string) => string | undefined;
  setPaneTitle: (paneId: string, title: string) => void;
}

export const PaneTitleContext = createContext<PaneTitleContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  getPaneTitle: null as any,
  setPaneTitle: null as any,
});
