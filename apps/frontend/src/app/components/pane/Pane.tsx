import { memo, useContext, useMemo } from 'react';
import { GlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import {
  PaneContext,
  type PaneContextData,
} from '../../context/pane/PaneContext';
import styled from 'styled-components';
import { paneableComponentNameToComponent } from '../../context/globalPane/PaneableComponent';

const PaneContainer = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const ComponentWrapper = styled.div`
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
`;

interface Props {
  id: string;
  navigationEventId: string;
}

export const Pane: React.FC<Props> = memo((props) => {
  const {
    navigateHistoryBack,
    navigateHistoryForward,
    getPaneById,
    navigate,
    focusedPaneId,
    renamePane,
  } = useContext(GlobalPaneContext);

  const pane = getPaneById(props.id);
  const isPaneFocused = pane.id === focusedPaneId;

  const contextValue = useMemo<PaneContextData>(
    () => ({
      navigateHistoryBack: () => navigateHistoryBack(props.id),
      navigateHistoryForward: () => navigateHistoryForward(props.id),
      navigate: (componentName, componentProps, transition, select) =>
        navigate(props.id, componentName, componentProps, transition, select),
      renamePane: (name: string) => renamePane(props.id, name),
      pane,
      isPaneFocused,
    }),
    [props.id, isPaneFocused],
  );

  const DisplayComponent =
    paneableComponentNameToComponent[pane.currentView.component];

  return (
    <PaneContainer>
      <PaneContext.Provider value={contextValue}>
        <ComponentWrapper key={pane.currentView.navigationEventId}>
          {/** Cast to any since we have no good way of generic-typing props stored in FlexLayout config and having them spit out here */}
          <DisplayComponent {...(pane.currentView.props as any)} />
        </ComponentWrapper>
      </PaneContext.Provider>
    </PaneContainer>
  );
});
