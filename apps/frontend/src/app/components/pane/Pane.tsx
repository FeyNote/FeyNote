import { useContext, useMemo } from 'react';
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
}

export const Pane: React.FC<Props> = (props) => {
  const {
    navigateHistoryBack,
    navigateHistoryForward,
    getPaneById,
    navigate,
    setFocusedPaneId,
    focusedPaneId,
  } = useContext(GlobalPaneContext);

  const pane = getPaneById(props.id);
  const isPaneFocused = pane.id === focusedPaneId;

  const contextValue = useMemo<PaneContextData>(
    () => ({
      navigateHistoryBack: () => navigateHistoryBack(props.id),
      navigateHistoryForward: () => navigateHistoryForward(props.id),
      navigate: (componentName, componentProps, transition) =>
        navigate(props.id, componentName, componentProps, transition),
      pane,
      isPaneFocused,
    }),
    [props.id, isPaneFocused],
  );

  const onPaneClicked = () => {
    if (!isPaneFocused) {
      setFocusedPaneId(props.id);
    }
  };

  const DisplayComponent =
    paneableComponentNameToComponent[pane.currentView.component];

  return (
    <PaneContainer onClick={onPaneClicked}>
      <PaneContext.Provider value={contextValue}>
        <ComponentWrapper key={pane.currentView.navigationEventId}>
          {/** Cast to any since we have no good way of generic-typing props stored in FlexLayout config and having them spit out here */}
          <DisplayComponent {...(pane.currentView.props as any)} />
        </ComponentWrapper>
      </PaneContext.Provider>
    </PaneContainer>
  );
};
