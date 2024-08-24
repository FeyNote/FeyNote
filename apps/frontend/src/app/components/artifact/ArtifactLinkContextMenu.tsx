import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useArtifactDelete } from './useArtifactDelete';
import { useContext } from 'react';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneContext } from '../../context/pane/PaneContext';

const ContextMenuContainer = styled.div`
  border: 1px solid gray;
`;

const ContextMenuGroup = styled.div`
  border: 1px solid gray;
`;

const ContextMenuItem = styled.div`
  height: 40px;
`;

interface Props {
  artifactId: string;
}

export const ArtifactLinkContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigateHistoryBack, navigate } = useContext(PaneContext);

  const { deleteArtifact } = useArtifactDelete(props.artifactId);

  const onDeleteArtifactClicked = () => {
    deleteArtifact().then(() => {
      navigateHistoryBack();
    });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(pane.currentView.component, PaneTransition.Push)
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(pane.currentView.component, PaneTransition.Push)
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(pane.currentView.component, PaneTransition.Push)
          }
        >
          {t('contextMenu.duplicateTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroup>
        <ContextMenuItem onClick={onDeleteArtifactClicked}>
          {t('generic.delete')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
