import { createContext } from 'react';
import type {
  PaneTracker,
  PaneTransition,
} from '../paneControl/PaneControlContext';

export interface PaneContextData {
  back: () => void;
  forward: () => void;
  navigate: (component: React.ReactNode, transition: PaneTransition) => void;
  pane: PaneTracker;
  isFocused: boolean;
}

export const PaneContext = createContext<PaneContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  back: null as any,
  forward: null as any,
  navigate: null as any,
  pane: null as any,
  isFocused: null as any,
});
