import { ReactNode, useEffect, useMemo, useReducer, useState } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
  type HistoryNode,
  type PaneTracker,
} from './GlobalPaneContext';
import {
  Action,
  Actions,
  DockLocation,
  Model,
  type TabNode,
  type TabSetNode,
} from 'flexlayout-react';
import {
  PaneableComponent,
  paneableComponentNameToDefaultI18nTitle,
  PaneableComponentProps,
} from './PaneableComponent';
import { t } from 'i18next';
import { useFlexLayout } from './useFlexLayout';
import { getArtifactSnapshotStore } from '../../utils/localDb/artifactSnapshots/artifactSnapshotStore';

class PaneNotFoundError extends Error {
  constructor(paneId: string) {
    super(`Pane with id ${paneId} not found`);
    this.name = 'PaneNotFoundError';
  }
}

interface Props {
  children: ReactNode;
}

export const GlobalPaneContextProviderWrapper: React.FC<Props> = ({
  children,
}) => {
  const { layout, applyLayoutJson, resetLayout, saveLayout } = useFlexLayout();
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const getFirstTab = (): TabNode => {
    let found: TabNode | undefined = undefined;
    layout.visitNodes((node) => {
      if (found) return;

      if (node.getType() === 'tab') {
        found = node as TabNode;
      }
    });

    if (!found) {
      // If there's no active pane, we need to create one for many of the assumptions throughout the app (things operate as if there's always at least one tab open!)
      const id = crypto.randomUUID();
      found = layout.doAction(
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
          (layout.getActiveTabset() || layout.getFirstTabSet()).getId(),
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
      layout.getActiveTabset()?.getSelectedNode()?.getId() ||
      getFirstTab().getId()
    );
  };
  const [focusedPaneId, setFocusedPaneId] = useState(() => getFocusedPaneId());

  const getSelectedTabForTabset = (
    tabsetId: string = layout.getFirstTabSet().getId(),
  ) => {
    const tabset = layout.getNodeById(tabsetId) as TabSetNode | undefined;
    if (!tabset) throw new Error('tabset not found');
    if (tabset.getType() !== 'tabset') throw new Error('not a tabset');
    const selectedTabNode = tabset.getSelectedNode() as TabNode;
    if (!selectedTabNode) throw new Error('no selected tab node');
    if (selectedTabNode.getType() !== 'tab')
      throw new Error('selected tab node is not a tab...');

    return selectedTabNode;
  };

  const getPaneById = (paneId = getFocusedPaneId()): PaneTracker => {
    const tabNode = layout.getNodeById(paneId) as TabNode | undefined;
    if (!tabNode || tabNode.getType() !== 'tab') {
      throw new PaneNotFoundError(paneId);
    }

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

    layout.doAction(
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

    layout.doAction(
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
    props: PaneableComponentProps[T],
    transition: PaneTransition,
    select = true,
  ) => {
    const { currentView, history, forwardHistory } = getPaneById(paneId);
    const tabset = layout.getNodeById(paneId)?.getParent();
    if (!tabset) throw new Error('Active tabset not found');

    const historyNode = {
      component,
      // We really don't want to type enforce props as it now just gets dumped into FlexLayout state
      props: props as HistoryNode['props'],
      navigationEventId: crypto.randomUUID(),
    } satisfies HistoryNode;

    switch (transition) {
      case PaneTransition.Push: {
        history.push(currentView);
        forwardHistory.splice(0, forwardHistory.length);
        layout.doAction(
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
        layout.doAction(
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
        layout.doAction(
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

        layout.doAction(
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

        asyncAssignDefaultTitle(id);

        break;
      }
    }
  };

  useEffect(() => {
    const listener = (event: PopStateEvent) => {
      if (!event.state?.layout) return;
      applyLayoutJson(event.state.layout);
      // This is the best way we have for now to handle native browser back
      // While this does work, it's slower than natively manipulating the state of the panes.
      // For now, encourage users to use in-app navigation techniques instead of browser back/forward (though they do work).
      //window.location.reload();
    };

    window.addEventListener('popstate', listener);

    return () => {
      window.removeEventListener('popstate', listener);
    };
  }, [layout]);

  const renamePane = (paneId: string, name: string) => {
    layout.doAction(Actions.renameTab(paneId, name));
  };

  /**
   * A method to assign a default title to a pane for some pane types that
   * render dynamic content (e.g. Artifact, etc.)
   */
  const asyncAssignDefaultTitle = async (paneId: string) => {
    const pane = getPaneById(paneId);
    const initialViewTitle = pane.currentView.props.title;
    const navigationEventId = pane.currentView.navigationEventId;

    let updatedTitle: string | undefined = undefined;
    if (pane.currentView.component === PaneableComponent.Artifact) {
      const artifactId = pane.currentView.props.id;

      const artifactSnapshotStore = getArtifactSnapshotStore();
      const snapshot =
        artifactSnapshotStore.getArtifactSnapshotById(artifactId);
      if (!snapshot) return;

      updatedTitle = snapshot.meta.title;
    }

    if (!updatedTitle) {
      return;
    }

    let possiblyUpdatedPane;
    try {
      possiblyUpdatedPane = getPaneById(paneId);
    } catch (e) {
      // If the pane has been closed, we don't need to do anything
      console.warn(e);
      return;
    }

    const isPaneStillInNeed =
      initialViewTitle === possiblyUpdatedPane.currentView.props.title &&
      navigationEventId === possiblyUpdatedPane.currentView.navigationEventId;

    if (!isPaneStillInNeed) {
      return;
    }

    renamePane(paneId, updatedTitle);
  };

  const updatePaneProps = <T extends PaneableComponent>(
    paneId: string,
    component: T,
    props: PaneableComponentProps[T],
  ) => {
    const { currentView } = getPaneById(paneId);
    if (currentView.component !== component) {
      throw new Error(
        `Cannot update props for a different component. Expected to update props for ${component}, but was provided ${currentView.component}`,
      );
    }

    layout.doAction(
      Actions.updateNodeAttributes(paneId, {
        config: {
          ...currentView,
          props,
        },
      }),
    );
  };

  const onActionListener = (action: Action) => {
    if (action.type === Actions.DELETE_TAB) {
      let tabCount = 0;
      layout.visitNodes((node) => {
        if (node.getType() === 'tab') {
          tabCount++;
        }
      });

      // Returning undefined cancels the tab delete action
      if (tabCount <= 1) return;
    }

    return action;
  };

  const onModelChangeListener = (_: Model, action: Action) => {
    saveLayout();

    if (
      [
        Actions.DELETE_TAB,
        Actions.ADD_NODE,
        Actions.UPDATE_NODE_ATTRIBUTES,
      ].includes(action.type)
    ) {
      window.history.pushState(
        {
          layout: layout.toJson(),
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
      action.type === Actions.ADJUST_WEIGHTS ||
      action.type === Actions.ADJUST_BORDER_SPLIT
    ) {
      setFocusedPaneId(getFocusedPaneId());
    }

    // We're doing this because FlexLayout v0.8+ doesn't trigger a re-render of our component
    // anymore when the layout changes. This is a workaround to force a re-render.
    triggerRerender();
    setTimeout(() => {
      // And this is to fix the padding issue where panes will creep outside of their containers
      // I love flexlayout, I swear I do... (kill me)
      triggerRerender();
    });
  };

  const value = useMemo(
    () => ({
      navigateHistoryBack,
      navigateHistoryForward,
      navigate,
      getPaneById,
      updatePaneProps,
      renamePane,
      focusedPaneId,
      getSelectedTabForTabset,
      resetLayout,
      _model: layout,
      _onActionListener: onActionListener,
      _onModelChangeListener: onModelChangeListener,
    }),
    [layout, focusedPaneId, _rerenderReducerValue],
  );

  return (
    <GlobalPaneContext.Provider value={value}>
      {children}
    </GlobalPaneContext.Provider>
  );
};
