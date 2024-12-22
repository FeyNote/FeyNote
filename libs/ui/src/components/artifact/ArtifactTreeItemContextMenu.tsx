import { useTranslation } from 'react-i18next';
import {
  ArtifactDeleteDeclinedError,
  useArtifactDelete,
} from './useArtifactDelete';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { useContext } from 'react';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

interface Props {
  artifactId: string;
  expandAll: () => void;
  collapseAll: () => void;
}

export const ArtifactTreeItemContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(GlobalPaneContext);

  const { deleteArtifact } = useArtifactDelete();

  const onDeleteArtifactClicked = () => {
    deleteArtifact(props.artifactId).catch((e) => {
      if (e instanceof ArtifactDeleteDeclinedError) return;

      throw e;
    });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              undefined,
              PaneableComponent.Artifact,
              {
                id: props.artifactId,
              },
              PaneTransition.HSplit,
            )
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              undefined,
              PaneableComponent.Artifact,
              {
                id: props.artifactId,
              },
              PaneTransition.VSplit,
            )
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              undefined,
              PaneableComponent.Artifact,
              {
                id: props.artifactId,
              },
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.newTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={props.expandAll}>
          {t('contextMenu.expandAll')}
        </ContextMenuItem>
        <ContextMenuItem onClick={props.collapseAll}>
          {t('contextMenu.collapseAll')}
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
