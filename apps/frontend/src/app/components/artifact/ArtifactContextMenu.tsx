import { useTranslation } from 'react-i18next';
import { useArtifactDelete } from './useArtifactDelete';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';

interface Props {
  artifactId: string;
}

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = useContext(PaneContext);

  const { deleteArtifact } = useArtifactDelete();

  const onDeleteArtifactClicked = () => {
    deleteArtifact(props.artifactId).then(() => {
      // TODO: navigate pane
    });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.HSplit,
            )
          }
        >
          {t('artifactRenderer.contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.VSplit,
            )
          }
        >
          {t('artifactRenderer.contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.NewTab,
            )
          }
        >
          {t('artifactRenderer.contextMenu.duplicateTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={onDeleteArtifactClicked}>
          {t('generic.delete')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
