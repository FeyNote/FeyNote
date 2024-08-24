import { useContext, useEffect } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { IonButton, IonContent, IonIcon, IonPopover } from '@ionic/react';
import { arrowBack, arrowForward, ellipsisHorizontal } from 'ionicons/icons';
import styled from 'styled-components';
import { PaneTitleContext } from '../../context/paneTitle/PaneTitleContext';

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);
`;

const NavGroup = styled.div`
  width: 80px;
  white-space: nowrap;
`;

const NavTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Props {
  title: string;
  popoverContents?: React.ReactNode;
}

export const PaneNav: React.FC<Props> = (props) => {
  const { back, forward, pane } = useContext(PaneContext);
  const { getPaneTitle, setPaneTitle } = useContext(PaneTitleContext);

  useEffect(() => {
    if (props.title !== getPaneTitle(pane.id)) {
      setPaneTitle(pane.id, props.title);
    }
  }, [props.title, pane]);

  return (
    <NavContainer>
      <NavGroup style={{ textAlign: 'left' }}>
        <IonButton
          onClick={() => back()}
          disabled={!pane.history.length}
          size="small"
          fill="clear"
        >
          <IonIcon icon={arrowBack} slot="icon-only" />
        </IonButton>
        <IonButton
          onClick={() => forward()}
          disabled={!pane.forwardHistory.length}
          size="small"
          fill="clear"
        >
          <IonIcon icon={arrowForward} slot="icon-only" />
        </IonButton>
      </NavGroup>
      <NavTitle>{props.title}</NavTitle>
      <NavGroup style={{ textAlign: 'right' }}>
        <IonButton
          id={`artifact-popover-trigger-${pane.id}-${pane.currentView.navigationEventId}`}
          size="small"
          fill="clear"
        >
          <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
        </IonButton>
        <IonPopover
          trigger={`artifact-popover-trigger-${pane.id}-${pane.currentView.navigationEventId}`}
          triggerAction="click"
        >
          <IonContent class="ion-padding">{props.popoverContents}</IonContent>
        </IonPopover>
      </NavGroup>
    </NavContainer>
  );
};
