import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useArtifactDelete } from './useArtifactDelete';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

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

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = useContext(PaneContext);

  const { deleteArtifact } = useArtifactDelete(props.artifactId);

  const onDeleteArtifactClicked = () => {
    deleteArtifact().then(() => {
      // TODO: navigate pane
    });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(pane.currentView.component, PaneTransition.HSplit)
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(pane.currentView.component, PaneTransition.VSplit)
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(pane.currentView.component, PaneTransition.NewTab)
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
