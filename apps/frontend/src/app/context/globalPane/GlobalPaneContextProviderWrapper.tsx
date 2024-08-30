import { ReactNode, useMemo, useState, type ComponentProps } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
  type HistoryNode,
  type PaneTracker,
} from './GlobalPaneContext';
import { Actions, DockLocation, Model, type TabNode } from 'flexlayout-react';
import {
  PaneableComponent,
  type paneableComponentNameToComponent,
} from './PaneableComponent';

interface Props {
  children: ReactNode;
}

export const GlobalPaneContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const model = useMemo(() => {
    const savedLayoutStr = localStorage.getItem('savedLayout');
    if (savedLayoutStr) {
      const savedLayout = JSON.parse(savedLayoutStr);
      return Model.fromJson(savedLayout);
    }

    return Model.fromJson({
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
                config: {
                  component: PaneableComponent.Dashboard,
                  props: {},
                  navigationEventId: crypto.randomUUID(),
                },
              },
            ],
          },
        ],
      },
    });
  }, []);

  const saveLayout = () => {
    localStorage.setItem('savedLayout', JSON.stringify(model.toJson()));
  };

  const getFirstTab = (): TabNode => {
    let found: TabNode | null = null;
    model.visitNodes((node) => {
      if (found) return;

      if (node.getType() === 'tab') {
        found = node as TabNode;
      }
    });

    if (!found) throw new Error('Could not find any tab in view...');
    return found;
  };

  const [focusedPaneId, setFocusedPaneId] = useState<string>(
    getFirstTab().getId(),
  );

  const getPaneById = (paneId = focusedPaneId): PaneTracker => {
    const tabNode = model.getNodeById(paneId) as TabNode | undefined;
    if (!tabNode || tabNode.getType() !== 'tab')
      throw new Error(`Pane with id ${paneId} not present in pane list`);

    let currentView = tabNode.getConfig() as HistoryNode | undefined;
    const extraData = tabNode.getExtraData();
    const history = extraData.history || [];
    const forwardHistory = extraData.forwardHistory || [];
    extraData.history = history;
    extraData.forwardHistory = forwardHistory;

    currentView = currentView || {
      component: PaneableComponent.Dashboard,
      props: {},
      navigationEventId: crypto.randomUUID(),
    };

    return {
      id: tabNode.getId(),
      currentView,
      history,
      forwardHistory,
    };
  };

  const navigateHistoryBack = (paneId = focusedPaneId) => {
    const pane = getPaneById(paneId);

    const canGoBack = !!pane.history?.length;
    if (!canGoBack) return;

    pane.forwardHistory.push(pane.currentView);
    pane.currentView = pane.history.splice(pane.history.length - 1, 1)[0];

    model.doAction(
      Actions.updateNodeAttributes(paneId, {
        config: pane.currentView,
        extraData: {
          forwardHistory: pane.forwardHistory,
          history: pane.history,
        },
      }),
    );

    saveLayout();
  };

  const navigateHistoryForward = (paneId = focusedPaneId) => {
    const pane = getPaneById(paneId);

    const canGoForward = !!pane.forwardHistory?.length;
    if (!canGoForward) return;

    pane.history.push(pane.currentView);
    pane.currentView = pane.forwardHistory.splice(
      pane.forwardHistory.length - 1,
      1,
    )[0];

    model.doAction(
      Actions.updateNodeAttributes(paneId, {
        config: pane.currentView,
        extraData: {
          forwardHistory: pane.forwardHistory,
          history: pane.history,
        },
      }),
    );

    saveLayout();
  };

  const navigate = <T extends PaneableComponent>(
    paneId = focusedPaneId,
    component: T,
    props: ComponentProps<(typeof paneableComponentNameToComponent)[T]>,
    transition: PaneTransition,
  ) => {
    const { currentView, history, forwardHistory } = getPaneById(paneId);
    const tabset = model.getNodeById(paneId)?.getParent();
    if (!tabset) throw new Error('Active tabset not found');

    const historyNode = {
      component,
      // We really don't want to type enforce props as it now just gets dumped into FlexLayout state
      props: props as any,
      navigationEventId: crypto.randomUUID(),
    } satisfies HistoryNode;

    switch (transition) {
      case PaneTransition.Push: {
        history.push(currentView);
        forwardHistory.splice(0, forwardHistory.length);
        model.doAction(
          Actions.updateNodeAttributes(paneId, {
            config: historyNode,
            extraData: {
              forwardHistory,
              history,
            },
          }),
        );

        break;
      }
      case PaneTransition.Replace: {
        forwardHistory.splice(0, forwardHistory.length);
        model.doAction(
          Actions.updateNodeAttributes(paneId, {
            config: historyNode,
            extraData: {
              forwardHistory,
              history,
            },
          }),
        );

        break;
      }
      case PaneTransition.Reset: {
        history.splice(0, history.length);
        forwardHistory.splice(0, forwardHistory.length);
        model.doAction(
          Actions.updateNodeAttributes(paneId, {
            config: historyNode,
            extraData: {
              forwardHistory,
              history,
            },
          }),
        );

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

        model.doAction(
          Actions.addNode(
            {
              id,
              type: 'tab',
              component: id,
              config: {
                component,
                props,
                navigationEventId: crypto.randomUUID(),
              },
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

    saveLayout();
  };

  const value = useMemo(
    () => ({
      navigateHistoryBack,
      navigateHistoryForward,
      navigate,
      getPaneById,
      setFocusedPaneId,
      focusedPaneId,
      _model: model,
    }),
    [model, focusedPaneId],
  );

  return (
    <GlobalPaneContext.Provider value={value}>
      {children}
    </GlobalPaneContext.Provider>
  );
};
