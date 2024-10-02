import { createContext } from 'react';
import type {
  PaneTracker,
  PaneTransition,
} from '../globalPane/GlobalPaneContext';
import type {
  PaneableComponent,
  PaneableComponentProps,
} from '../globalPane/PaneableComponent';

export interface PaneContextData {
  navigateHistoryBack: () => void;
  navigateHistoryForward: () => void;
  navigate: <T extends PaneableComponent>(
    component: T,
    props: PaneableComponentProps[T],
    transition: PaneTransition,
    select?: boolean,
  ) => void;
  renamePane: (name: string) => void;
  pane: PaneTracker;
  isPaneFocused: boolean;
}

export const PaneContext = createContext<PaneContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  navigateHistoryForward: null as any,
  navigateHistoryBack: null as any,
  navigate: null as any,
  renamePane: null as any,
  pane: null as any,
  isPaneFocused: null as any,
});
