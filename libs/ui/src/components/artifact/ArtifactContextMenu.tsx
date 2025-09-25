import { useTranslation } from 'react-i18next';
import { PaneContextData } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { CollaborationManagerConnection } from '../../utils/collaboration/collaborationManager';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { createArtifact } from '../../utils/createArtifact';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';
import { cloneArtifact } from '../../utils/cloneArtifact';

interface Props {
  artifactId: string;
  triggerDelete: () => void;
  triggerUndelete: () => void;
  connection: CollaborationManagerConnection;
  pane: PaneContextData['pane'];
  navigate: PaneContextData['navigate'];
  authorizedScope: CollaborationConnectionAuthorizedScope;
}

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = props;

  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { deletedAt } = useObserveYArtifactMeta(props.connection.yjsDoc);

  const onPrintArtifactClicked = () => {
    window.open(
      `${window.location.hostname}?printArtifactId=${props.artifactId}&autoPrint=true`,
    );
  };

  const onDuplicateArtifactClicked = async () => {
    const { title } = getMetaFromYArtifact(props.connection.yjsDoc);

    const newTitle = t('artifact.duplicateTitle', { title });

    const newYDoc = await cloneArtifact({
      title: newTitle,
      y: props.connection.yjsDoc,
    });

    const result = await createArtifact({
      artifact: {
        y: newYDoc,
      },
    }).catch((e) => {
      handleTRPCErrors(e);
    });

    if (!result) return;

    navigate(
      PaneableComponent.Artifact,
      { id: result.id },
      PaneTransition.NewTab,
    );
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
          {t('contextMenu.splitRight')}
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
          {t('contextMenu.splitDown')}
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
          {t('contextMenu.duplicateTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={onPrintArtifactClicked}>
          {t('contextMenu.printArtifact')}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicateArtifactClicked}>
          {t('contextMenu.duplicateArtifact')}
        </ContextMenuItem>
        {props.authorizedScope ===
          CollaborationConnectionAuthorizedScope.CoOwner &&
          !deletedAt && (
            <ContextMenuItem onClick={props.triggerDelete}>
              {t('generic.delete')}
            </ContextMenuItem>
          )}
        {props.authorizedScope ===
          CollaborationConnectionAuthorizedScope.CoOwner &&
          deletedAt && (
            <ContextMenuItem onClick={props.triggerUndelete}>
              {t('artifact.deleted.undelete')}
            </ContextMenuItem>
          )}
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
