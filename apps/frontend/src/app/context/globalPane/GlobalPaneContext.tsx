import type { Model } from 'flexlayout-react';
import { createContext, type ComponentProps } from 'react';
import type {
  PaneableComponent,
  paneableComponentNameToComponent,
} from './PaneableComponent';

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
  component: PaneableComponent;
  props: Record<string, string>;
  navigationEventId: string;
}

export type PaneTracker = {
  id: string;
  history: HistoryNode[];
  forwardHistory: HistoryNode[];
  currentView: HistoryNode;
};

interface GlobalPaneContextData {
  /**
   * Move the desired view back in history
   */
  navigateHistoryBack: (paneId: string | undefined) => void;
  /**
   * Move the desired view forward in history
   */
  navigateHistoryForward: (paneId: string | undefined) => void;
  getPaneById: (paneId: string | undefined) => PaneTracker;
  /**
   * Changes the title of the pane displayed in the tab bar
   */
  renamePane: (paneId: string, name: string) => void;
  /**
   * A method to fetch the paneid we currently consider has the user's focus within it
   */
  getFocusedPaneId(): string;
  /**
   * Will return the selected pane of the tabset provided (or the first tabset if no tabsetid provided)
   */
  getSelectedTabForTabset: (tabsetId?: string) => void;
  /**
   * Open a component within a pane/tabset with the desired transition
   */
  navigate: <T extends PaneableComponent>(
    paneId: string | undefined,
    component: T,
    props: ComponentProps<(typeof paneableComponentNameToComponent)[T]>,
    transition: PaneTransition,
  ) => void;
  /**
   * DO NOT INTERACT WITH THIS DIRECTLY IN YOUR COMPONENTS.
   * All interaction with this model should occur using PaneControl. This model is present here simply to render FlexLayout.
   */
  _model: Model;
}

export const GlobalPaneContext = createContext<GlobalPaneContextData>({
  // We cast null to any so that any usage of this context without initialization blows up in
  // catastrophic fashion
  navigateHistoryBack: null as any,
  navigateHistoryForward: null as any,
  navigate: null as any,
  getPaneById: null as any,
  getFocusedPaneId: null as any,
  renamePane: null as any,
  getSelectedTabForTabset: null as any,
  _model: null as any,
});
