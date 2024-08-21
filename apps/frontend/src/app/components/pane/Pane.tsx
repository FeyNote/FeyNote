import { useContext, useState } from 'react';
import { IonButton } from '@ionic/react';
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
  const {
    back,
    forward,
    get,
    push,
    focus,
    openInNewTab,
    openInVerticalSplit,
    openInHorizontalSplit,
  } = useContext(PaneControlContext);

  const pane = get(props.id);

  const contextValue = {
    back: () => back(props.id),
    forward: () => forward(props.id),
    push: (historyNode) => push(props.id, historyNode),
    openInNewTab: (historyNode) => openInNewTab(props.id, historyNode),
    openInVerticalSplit: (historyNode) =>
      openInVerticalSplit(props.id, historyNode),
    openInHorizontalSplit: (historyNode) =>
      openInHorizontalSplit(props.id, historyNode),
    pane,
  } satisfies PaneContextData;

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
