import { createContext } from 'react';
import type {
  HistoryNode,
  PaneTracker,
} from '../paneControl/PaneControlContext';

export interface PaneContextData {
  back: () => void;
  forward: () => void;
  push: (historyNode: HistoryNode) => void;
  openInNewTab: (historyNode: HistoryNode) => string;
  openInVerticalSplit: (historyNode: HistoryNode) => string;
  openInHorizontalSplit: (historyNode: HistoryNode) => string;
  pane: PaneTracker;
}

export const PaneContext = createContext<PaneContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  back: null as any,
  forward: null as any,
  push: null as any,
  openInNewTab: null as any,
  openInVerticalSplit: null as any,
  openInHorizontalSplit: null as any,
  pane: null as any,
});
