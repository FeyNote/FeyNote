import { useEffect } from 'react';
import { usePaneContext } from '../../context/pane/PaneContext';
import { IonButton, IonIcon } from '@ionic/react';
import { arrowBack, arrowForward, ellipsisHorizontal } from 'ionicons/icons';
import styled from 'styled-components';
import { DefaultPaneDropdownMenu } from './DefaultPaneDropdownMenu';

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
  renderDropdownMenu?: ((children: React.ReactNode) => React.ReactNode) | null;
}

export const PaneNav: React.FC<Props> = (props) => {
  const { navigateHistoryBack, navigateHistoryForward, pane, renamePane } =
    usePaneContext();

  useEffect(() => {
    // Since pane itself is memoized, this does not cause re-render of entire pane, but rather just the tab title itself
    renamePane(props.title);
  }, [props.title]);

  const renderDropdownButton = () => {
    const contents = (
      <IonButton
        size="small"
        fill="clear"
        disabled={props.renderDropdownMenu === null}
      >
        <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
      </IonButton>
    );

    if (props.renderDropdownMenu) {
      return props.renderDropdownMenu(contents);
    }
    if (props.renderDropdownMenu !== null) {
      return (
        <DefaultPaneDropdownMenu paneId={pane.id}>
          {contents}
        </DefaultPaneDropdownMenu>
      );
    }

    return contents;
  };

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
        {renderDropdownButton()}
      </NavGroup>
    </NavContainer>
  );
};
