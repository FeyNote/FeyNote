import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useArtifactDelete } from './useArtifactDelete';
import { useContext } from 'react';
import { PaneControlContext } from '../../context/paneControl/PaneControlContext';
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

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, openInVerticalSplit, openInHorizontalSplit, openInNewTab } =
    useContext(PaneContext);

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
          onClick={() => openInHorizontalSplit(pane.currentView)}
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => openInVerticalSplit(pane.currentView)}>
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => openInNewTab(pane.currentView)}>
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
