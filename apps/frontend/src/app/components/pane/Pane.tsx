import { useContext, useMemo } from 'react';
import { GlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import {
  PaneContext,
  type PaneContextData,
} from '../../context/pane/PaneContext';
import styled from 'styled-components';

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
      navigate: (transition, historyNode) =>
        navigate(props.id, transition, historyNode),
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

  return (
    <PaneContainer onClick={onPaneClicked}>
      <PaneContext.Provider value={contextValue}>
        <ComponentWrapper key={pane.currentView.navigationEventId}>
          {pane.currentView.component}
        </ComponentWrapper>
      </PaneContext.Provider>
    </PaneContainer>
  );
};
