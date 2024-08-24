import { useContext, useMemo } from 'react';
import { PaneControlContext } from '../../context/paneControl/PaneControlContext';
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
  const { back, forward, get, navigate, focus, focusedPaneId } =
    useContext(PaneControlContext);

  const pane = get(props.id);

  const contextValue = useMemo<PaneContextData>(
    () => ({
      back: () => back(props.id),
      forward: () => forward(props.id),
      navigate: (transition, historyNode) =>
        navigate(props.id, transition, historyNode),
      pane,
      isFocused: pane.id === focusedPaneId,
    }),
    [props.id, focusedPaneId],
  );

  return (
    <PaneContainer onClick={() => focus(props.id)}>
      <PaneContext.Provider value={contextValue}>
        <ComponentWrapper key={pane.currentView.navigationEventId}>
          {pane.currentView.component}
        </ComponentWrapper>
      </PaneContext.Provider>
    </PaneContainer>
  );
};
