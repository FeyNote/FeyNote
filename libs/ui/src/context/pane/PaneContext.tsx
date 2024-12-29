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

export const PaneContext = createContext<PaneContextData>(
  null as unknown as PaneContextData,
);
