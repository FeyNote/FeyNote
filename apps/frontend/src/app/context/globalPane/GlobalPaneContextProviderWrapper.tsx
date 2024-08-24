import { ReactNode, useMemo, useReducer, useRef, useState } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
  type HistoryNode,
  type PaneTracker,
} from './GlobalPaneContext';
import { Actions, DockLocation, Model } from 'flexlayout-react';
import { Dashboard } from '../../components/dashboard/Dashboard';

interface Props {
  children: ReactNode;
}

export const GlobalPaneContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const defaultPanes = new Map<string, PaneTracker>([
    [
      'default',
      {
        id: 'default',
        currentView: {
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
          tabSetTabStripHeight: 36,
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

  const navigateHistoryBack = (paneId = focusedPaneId) => {
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

  const navigateHistoryForward = (paneId = focusedPaneId) => {
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

  const getPaneById = (paneId = focusedPaneId) => {
    const pane = panes.get(paneId);
    if (!pane)
      throw new Error(`Pane with id ${paneId} not present in pane list`);
    return pane;
  };

  const navigate = (
    paneId = focusedPaneId,
    component: React.ReactNode,
    transition: PaneTransition,
  ) => {
    const pane = panes.get(paneId);
    if (!pane)
      throw new Error(`Pane with id ${paneId} not present in pane list`);
    const tabset = model.getNodeById(paneId)?.getParent();
    if (!tabset) throw new Error('Active tabset not found');

    const historyNode = {
      component,
      navigationEventId: crypto.randomUUID(),
    } satisfies HistoryNode;

    switch (transition) {
      case PaneTransition.Push: {
        pane.history.push(pane.currentView);
        pane.currentView = historyNode;
        pane.forwardHistory.splice(0, pane.forwardHistory.length);

        break;
      }
      case PaneTransition.Replace: {
        pane.currentView = historyNode;
        pane.forwardHistory.splice(0, pane.forwardHistory.length);

        break;
      }
      case PaneTransition.Reset: {
        pane.currentView = historyNode;
        pane.history.splice(0, pane.history.length);
        pane.forwardHistory.splice(0, pane.forwardHistory.length);

        break;
      }
      case PaneTransition.NewTab:
      case PaneTransition.VSplit:
      case PaneTransition.HSplit: {
        const transitionToDockLocation = {
          [PaneTransition.NewTab]: DockLocation.CENTER,
          [PaneTransition.VSplit]: DockLocation.BOTTOM,
          [PaneTransition.HSplit]: DockLocation.RIGHT,
        };
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
            transitionToDockLocation[transition],
            -1,
            true,
          ),
        );

        break;
      }
    }

    triggerRerender();
  };

  const value = useMemo(
    () => ({
      panes,
      navigateHistoryBack,
      navigateHistoryForward,
      navigate,
      getPaneById,
      setFocusedPaneId,
      focusedPaneId,
      _model: model,
    }),
    [_rerenderReducerValue, model],
  );

  return (
    <GlobalPaneContext.Provider value={value}>
      {children}
    </GlobalPaneContext.Provider>
  );
};
