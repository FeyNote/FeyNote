import type { Model } from 'flexlayout-react';
import { createContext } from 'react';

export enum PaneTransition {
  /**
   * Adds the new view to the navigation, maintaining history.
   */
  Push = 'push',
  /**
   * Replaces the current view with the new view, maintaining history.
   */
  Replace = 'replace',
  /**
   * Destroys all history and replaces the current view with the new view.
   */
  Reset = 'reset',
  /**
   * Creates a new tab within the tabset relative to the current view with it's own history
   */
  NewTab = 'newTab',
  /**
   * Creates a new tab & tabset to the right of the current tabset with it's own history
   */
  HSplit = 'hSplit',
  /**
   * Creates a new tab & tabset to the bottom of the current tabset with it's own history
   */
  VSplit = 'vSplit',
}

export interface HistoryNode {
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
  /**
   * Move the desired view back in history
   */
  back: (paneId: string | undefined) => void;
  /**
   * Move the desired view forward in history
   */
  forward: (paneId: string | undefined) => void;
  get: (paneId: string | undefined) => PaneTracker;
  /**
   * Marks the specified pane as focused (but does not "focus" in a traditional browser sense)
   */
  focus: (paneId: string) => void;
  /**
   * The currently user-focused pane (not necessarily tracking browser "focus")
   */
  focusedPaneId: string;
  /**
   * Open a component within a pane/tabset with the desired transition
   */
  navigate: (
    paneId: string | undefined,
    component: React.ReactNode,
    transition: PaneTransition,
  ) => void;
  /**
   * DO NOT INTERACT WITH THIS DIRECTLY IN YOUR COMPONENTS.
   * All interaction with this model should occur using PaneControl. This model is present here simply to render FlexLayout.
   */
  model: Model;
}

export const PaneControlContext = createContext<PaneControlContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  panes: null as any,
  back: null as any,
  forward: null as any,
  navigate: null as any,
  get: null as any,
  model: null as any,
  focus: null as any,
  focusedPaneId: null as any,
});
