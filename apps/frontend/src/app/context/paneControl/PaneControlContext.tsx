import type { Model } from 'flexlayout-react';
import type { LayoutBase } from 'rc-dock';
import { createContext, type SetStateAction } from 'react';

export interface HistoryNode {
  title: string;
  component: React.ReactNode;
  navigationEventId: string;
}

export type PaneTracker = {
  id: string;
  history: HistoryNode[];
  forwardHistory: HistoryNode[];
  currentView: HistoryNode;
};

interface PaneControlContextData {
  panes: ReadonlyMap<string, PaneTracker>;
  back: (paneId: string | undefined) => void;
  forward: (paneId: string | undefined) => void;
  push: (paneId: string | undefined, historyNode: HistoryNode) => void;
  get: (paneId: string | undefined) => PaneTracker;
  focus: (paneId: string) => void;
  openInNewTab: (
    paneId: string | undefined,
    historyNode: HistoryNode,
  ) => string;
  openInVerticalSplit: (
    paneId: string | undefined,
    historyNode: HistoryNode,
  ) => string;
  openInHorizontalSplit: (
    paneId: string | undefined,
    historyNode: HistoryNode,
  ) => string;
  model: Model;
}

export const PaneControlContext = createContext<PaneControlContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  panes: null as any,
  back: null as any,
  forward: null as any,
  push: null as any,
  get: null as any,
  openInNewTab: null as any,
  openInVerticalSplit: null as any,
  openInHorizontalSplit: null as any,
  model: null as any,
  focus: null as any,
});
