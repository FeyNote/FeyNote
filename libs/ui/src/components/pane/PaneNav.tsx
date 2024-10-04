import { useContext, useEffect } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { IonButton, IonContent, IonIcon, IonPopover } from '@ionic/react';
import { arrowBack, arrowForward, ellipsisHorizontal } from 'ionicons/icons';
import styled from 'styled-components';
import { DefaultContextMenu } from '../contextMenu/DefaultContextMenu';

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background: var(--ion-background-color, #ffffff);
  color: var(--ion-text-color, #000000);
`;

const NavGroup = styled.div`
  width: 80px;
  white-space: nowrap;
`;

interface Props {
  title: string;
  // Pass null to disable the popover. Not passing this prop will use the default context menu
  popoverContents?: React.ReactNode | null;
}

export const PaneNav: React.FC<Props> = (props) => {
  const { navigateHistoryBack, navigateHistoryForward, pane, renamePane } =
    useContext(PaneContext);

  useEffect(() => {
    // Since pane itself is memoized, this does not cause re-render of entire pane, but rather just the tab title itself
    renamePane(props.title);
  }, [props.title]);

  return (
    <NavContainer>
      <NavGroup style={{ textAlign: 'left' }}>
        <IonButton
          onClick={() => navigateHistoryBack()}
          disabled={!pane.history.length}
          size="small"
          fill="clear"
        >
          <IonIcon icon={arrowBack} slot="icon-only" />
        </IonButton>
        <IonButton
          onClick={() => navigateHistoryForward()}
          disabled={!pane.forwardHistory.length}
          size="small"
          fill="clear"
        >
          <IonIcon icon={arrowForward} slot="icon-only" />
        </IonButton>
      </NavGroup>
      <NavGroup style={{ textAlign: 'right' }}>
        <IonButton
          id={`artifact-popover-trigger-${pane.id}-${pane.currentView.navigationEventId}`}
          size="small"
          fill="clear"
          disabled={props.popoverContents === null}
        >
          <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
        </IonButton>
        <IonPopover
          trigger={`artifact-popover-trigger-${pane.id}-${pane.currentView.navigationEventId}`}
          triggerAction="click"
          dismissOnSelect={true}
        >
          <IonContent>
            {props.popoverContents || <DefaultContextMenu />}
          </IonContent>
        </IonPopover>
      </NavGroup>
    </NavContainer>
  );
};
