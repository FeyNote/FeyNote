import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
  type HistoryNode,
  type PaneTracker,
} from './GlobalPaneContext';
import {
  Actions,
  DockLocation,
  Model,
  type Action,
  type IGlobalAttributes,
  type TabNode,
  type TabSetNode,
} from 'flexlayout-react';
import {
  PaneableComponent,
  paneableComponentNameToDefaultI18nTitle,
  type paneableComponentNameToComponent,
} from './PaneableComponent';
import { t } from 'i18next';

interface Props {
  children: ReactNode;
}

export const GlobalPaneContextProviderWrapper = ({
  children,
}: Props): JSX.Element => {
  const model = useMemo(() => {
    const global = {
      tabEnableRename: false,
      tabEnableFloat: false,
      tabDragSpeed: 0.2,
      tabSetMinWidth: 200,
      tabSetEnableMaximize: false,
      tabSetTabStripHeight: 36,
    } satisfies IGlobalAttributes;

    // TODO: move this to a idb KVstore
    const savedLayoutStr = localStorage.getItem('savedLayout');
    if (savedLayoutStr) {
      const savedLayout = JSON.parse(savedLayoutStr);
      savedLayout.global = global;
      return Model.fromJson(savedLayout);
    }

    return Model.fromJson({
      global,
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
                name: t('dashboard.title'),
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

  const getFirstTab = (): TabNode => {
    let found: TabNode | undefined = undefined;
    model.visitNodes((node) => {
      if (found) return;

      if (node.getType() === 'tab') {
        found = node as TabNode;
      }
    });

    if (!found) {
      // If there's no active pane, we need to create one for many of the assumptions throughout the app (things operate as if there's always at least one tab open!)
      const id = crypto.randomUUID();
      found = model.doAction(
        Actions.addNode(
          {
            id,
            type: 'tab',
            component: id,
            name: t(
              paneableComponentNameToDefaultI18nTitle[
                PaneableComponent.Dashboard
              ],
            ),
            config: {
              component: PaneableComponent.Dashboard,
              props: {},
              navigationEventId: crypto.randomUUID(),
            },
          },
          (model.getActiveTabset() || model.getFirstTabSet()).getId(),
          DockLocation.CENTER,
          -1,
          true,
        ),
      ) as TabNode;
    }

    return found;
  };

  const getFocusedPaneId = () => {
    return (
      model.getActiveTabset()?.getSelectedNode()?.getId() ||
      getFirstTab().getId()
    );
  };
  const [focusedPaneId, setFocusedPaneId] = useState(getFocusedPaneId());

  const getSelectedTabForTabset = (
    tabsetId: string = model.getFirstTabSet().getId(),
  ) => {
    const tabset = model.getNodeById(tabsetId) as TabSetNode | undefined;
    if (!tabset) throw new Error('tabset not found');
    if (tabset.getType() !== 'tabset') throw new Error('not a tabset');
    const selectedTabNode = tabset.getSelectedNode() as TabNode;
    if (!selectedTabNode) throw new Error('no selected tab node');
    if (selectedTabNode.getType() !== 'tab')
      throw new Error('selected tab node is not a tab...');

    return selectedTabNode;
  };

  const getPaneById = (paneId = getFocusedPaneId()): PaneTracker => {
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

  const navigateHistoryBack = (paneId = getFocusedPaneId()) => {
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
  };

  const navigateHistoryForward = (paneId = getFocusedPaneId()) => {
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
  };

  const navigate = <T extends PaneableComponent>(
    paneId = getFocusedPaneId(),
    component: T,
    props: ComponentProps<(typeof paneableComponentNameToComponent)[T]>,
    transition: PaneTransition,
    select = true,
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
              name: t(paneableComponentNameToDefaultI18nTitle[component]),
              config: {
                component,
                props,
                navigationEventId: crypto.randomUUID(),
              },
            },
            tabset.getId(),
            transitionToDockLocation[transition],
            -1,
            select,
          ),
        );

        break;
      }
    }
  };

  useEffect(() => {
    const listener = (event: PopStateEvent) => {
      if (!event.state?.layout) return;
      localStorage.setItem('savedLayout', JSON.stringify(event.state.layout));
      // This is the best way we have for now to handle native browser back
      // While this does work, it's slower than natively manipulating the state of the panes.
      // For now, encourage users to use in-app navigation techniques instead of browser back/forward (though they do work).
      window.location.reload();
    };

    window.addEventListener('popstate', listener);

    return () => {
      window.removeEventListener('popstate', listener);
    };
  }, [model]);

  const renamePane = (paneId: string, name: string) => {
    model.doAction(Actions.renameTab(paneId, name));
  };

  const onActionListener = (action: Action) => {
    // Placeholder for now, but can be used to cancel actions
    // or react to actions

    return action;
  };

  const onModelChangeListener = (model: Model, action: Action) => {
    localStorage.setItem('savedLayout', JSON.stringify(model.toJson()));

    if (
      [
        Actions.DELETE_TAB,
        Actions.ADD_NODE,
        Actions.UPDATE_NODE_ATTRIBUTES,
      ].includes(action.type)
    ) {
      window.history.pushState(
        {
          layout: model.toJson(),
        },
        '',
      );
    }

    if (
      action.type === Actions.SET_ACTIVE_TABSET ||
      action.type === Actions.SELECT_TAB ||
      action.type === Actions.DELETE_TAB ||
      action.type === Actions.DELETE_TABSET ||
      action.type === Actions.ADD_NODE ||
      action.type === Actions.MOVE_NODE ||
      action.type === Actions.ADJUST_SPLIT
    ) {
      setFocusedPaneId(getFocusedPaneId());
    }
  };

  const value = useMemo(
    () => ({
      navigateHistoryBack,
      navigateHistoryForward,
      navigate,
      getPaneById,
      renamePane,
      focusedPaneId,
      getSelectedTabForTabset,
      _model: model,
      _onActionListener: onActionListener,
      _onModelChangeListener: onModelChangeListener,
    }),
    [model, focusedPaneId],
  );

  return (
    <GlobalPaneContext.Provider value={value}>
      {children}
    </GlobalPaneContext.Provider>
  );
};
