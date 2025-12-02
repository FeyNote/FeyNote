import { useMemo, useState } from 'react';
import { PaneContext, type PaneContextData } from '../pane/PaneContext';
import {
  GlobalPaneContext,
  type GlobalPaneContextData,
} from './GlobalPaneContext';
import {
  PaneableComponent,
  type PaneableComponentProps,
} from './PaneableComponent';
import type { Model } from 'flexlayout-react';

interface Props<T extends PaneableComponent> {
  navigationEventId: string;
  component: T;
  props: PaneableComponentProps[T];
  onNavigate: <U extends PaneableComponent>(
    newComponent: U,
    props: PaneableComponentProps[U],
  ) => void;
  children: React.ReactNode;
}

/**
 * This provides the requisite "pane" stuff when you're rendering in
 * a view that does not use a multi-pane workspace.
 */
export const SinglePaneGlobalPaneContextProviderWrapper = <
  T extends PaneableComponent,
>(
  props: Props<T>,
) => {
  const [paneId] = useState(() => crypto.randomUUID());

  const globalPaneContextValue = useMemo<GlobalPaneContextData>(
    () => ({
      navigateHistoryBack: () => undefined, // Noop
      navigateHistoryForward: () => undefined, // Noop
      getPaneById: () => ({
        id: paneId,
        history: [],
        forwardHistory: [],
        currentView: {
          component: props.component,
          navigationEventId: props.navigationEventId,
          props: props.props,
        },
      }),
      renamePane: () => undefined, // Noop
      updatePaneProps: () => undefined, // Noop
      focusedPaneId: paneId,
      getSelectedTabForTabset: () => undefined, // Noop
      navigate: (_, componentName, componentProps) => {
        props.onNavigate(componentName, componentProps);
      },
      resetLayout: () => undefined, // Noop
      _model: null as unknown as Model, // We have no good way to mock this
      _onActionListener: () => undefined, // Noop
      _onModelChangeListener: () => undefined, // Noop
    }),
    [],
  );

  const paneContextValue = useMemo<PaneContextData>(
    () => ({
      navigateHistoryBack: () => undefined, // Noop
      navigateHistoryForward: () => undefined, // Noop
      navigate: (componentName, componentProps) => {
        if (componentName === PaneableComponent.Artifact) {
          const id = (componentProps as PaneableComponentProps['Artifact']).id;

          const url = new URL(`/artifact/${id}`, window.location.href);

          window.location.href = url.href;
        } else {
          // Noop
        }
      },
      renamePane: () => undefined, // Noop
      pane: {
        id: paneId,
        history: [],
        forwardHistory: [],
        currentView: {
          component: props.component,
          navigationEventId: props.navigationEventId,
          props: props.props,
        },
      },
      isPaneFocused: true,
    }),
    [props.navigationEventId],
  );

  return (
    <GlobalPaneContext.Provider value={globalPaneContextValue}>
      <PaneContext.Provider value={paneContextValue}>
        {props.children}
      </PaneContext.Provider>
    </GlobalPaneContext.Provider>
  );
};
