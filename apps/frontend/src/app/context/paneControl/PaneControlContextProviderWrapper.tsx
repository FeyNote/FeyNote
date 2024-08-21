import { ReactNode, useMemo, useReducer, useRef, useState } from 'react';
import {
  PaneControlContext,
  type HistoryNode,
  type PaneTracker,
} from './PaneControlContext';
import { Actions, DockLocation, Model } from 'flexlayout-react';
import { Dashboard } from '../../components/dashboard/Dashboard';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

export const PaneControlContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { t } = useTranslation();
  const defaultPanes = new Map<string, PaneTracker>([
    [
      'default',
      {
        id: 'default',
        currentView: {
          title: t('menu.dashboard'),
          component: <Dashboard />,
          navigationEventId: crypto.randomUUID(),
        },
        history: [],
        forwardHistory: [],
      },
    ],
  ]);
  const panesRef = useRef<Map<string, PaneTracker>>(defaultPanes);
  const panes = panesRef.current;
  const [focusedPaneId, setFocusedPaneId] = useState<string>(
    [...panes.keys()][0],
  );

  const model = useMemo(
    () =>
      Model.fromJson({
        global: {
          tabEnableRename: false,
          tabEnableFloat: false,
          tabDragSpeed: 0.2,
          tabSetMinWidth: 200,
          tabSetEnableMaximize: false,
        },
        borders: [],
        layout: {
          type: 'row',
          weight: 100,
          children: [
            {
              type: 'tabset',
              weight: 50,
              children: [
                {
                  id: 'default',
                  type: 'tab',
                  component: 'default',
                },
              ],
            },
          ],
        },
      }),
    [],
  );

  const back = (paneId = focusedPaneId) => {
    const pane = panes.get(paneId);
    if (!pane)
      throw new Error(`Pane with id ${paneId} not present in pane list`);
    const canGoBack = pane.history.length > 0;
    if (!canGoBack) return;

    const currentView = pane.currentView;
    pane.currentView = pane.history.splice(pane.history.length - 1, 1)[0];
    pane.forwardHistory.push(currentView);

    triggerRerender();
  };

  const forward = (paneId = focusedPaneId) => {
    const pane = panes.get(paneId);
    if (!pane)
      throw new Error(`Pane with id ${paneId} not present in pane list`);
    const canGoForward = pane.forwardHistory.length > 0;
    if (!canGoForward) return;

    const currentView = pane.currentView;
    pane.currentView = pane.forwardHistory.splice(
      pane.history.length - 1,
      1,
    )[0];
    pane.history.push(currentView);

    triggerRerender();
  };

  const push = (paneId = focusedPaneId, historyNode: HistoryNode) => {
    const pane = panes.get(paneId);
    if (!pane)
      throw new Error(`Pane with id ${paneId} not present in pane list`);
    pane.history.push(pane.currentView);
    pane.currentView = historyNode;
    pane.forwardHistory.splice(0, pane.forwardHistory.length);

    console.log(pane.history);

    triggerRerender();
  };
  console.log('rendering');

  const get = (paneId = focusedPaneId) => {
    const pane = panes.get(paneId);
    if (!pane)
      throw new Error(`Pane with id ${paneId} not present in pane list`);
    return pane;
  };

  console.log(model);

  const newTab = (
    relativeNodeId = focusedPaneId,
    historyNode: HistoryNode,
    location: DockLocation,
  ) => {
    const tabset = model.getNodeById(relativeNodeId)?.getParent();
    if (!tabset) throw new Error('Active tabset not found');

    const id = crypto.randomUUID();

    panes.set(id, {
      id,
      forwardHistory: [],
      history: [],
      currentView: historyNode,
    });
    model.doAction(
      Actions.addNode(
        {
          id,
          type: 'tab',
          component: id,
        },
        tabset.getId(),
        location,
        -1,
        true,
      ),
    );

    return id;
  };

  const openInNewTab = (paneId = focusedPaneId, historyNode: HistoryNode) => {
    return newTab(paneId, historyNode, DockLocation.CENTER);
  };

  const openInVerticalSplit = (
    paneId = focusedPaneId,
    historyNode: HistoryNode,
  ) => {
    return newTab(paneId, historyNode, DockLocation.BOTTOM);
  };

  const openInHorizontalSplit = (
    paneId = focusedPaneId,
    historyNode: HistoryNode,
  ) => {
    return newTab(paneId, historyNode, DockLocation.RIGHT);
  };

  const focus = (paneId: string) => {
    setFocusedPaneId(paneId);
  };

  const value = {
    panes,
    back,
    forward,
    push,
    get,
    openInNewTab,
    openInVerticalSplit,
    openInHorizontalSplit,
    focus,
    model,
  };

  return (
    <PaneControlContext.Provider value={value}>
      {children}
    </PaneControlContext.Provider>
  );
};
