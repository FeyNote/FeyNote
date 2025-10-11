import { createContext, useContext } from 'react';
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

export const PaneContext = createContext<PaneContextData | null>(null);

export const usePaneContext = (): PaneContextData => {
  const val = useContext(PaneContext);

  if (!val) {
    throw new Error(
      'PaneContext used within component that does not inherit from PaneContextProvider',
    );
  }

  return val;
};
