import { createContext } from 'react';
import type {
  PaneTracker,
  PaneTransition,
} from '../globalPane/GlobalPaneContext';

export interface PaneContextData {
  navigateHistoryBack: () => void;
  navigateHistoryForward: () => void;
  navigate: (component: React.ReactNode, transition: PaneTransition) => void;
  pane: PaneTracker;
  isPaneFocused: boolean;
}

export const PaneContext = createContext<PaneContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  navigateHistoryForward: null as any,
  navigateHistoryBack: null as any,
  navigate: null as any,
  pane: null as any,
  isPaneFocused: null as any,
});
