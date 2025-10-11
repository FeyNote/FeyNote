import { useTranslation } from 'react-i18next';
import { PaneContextData } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { CollaborationManagerConnection } from '../../utils/collaboration/collaborationManager';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useObserveYArtifactMeta } from '../../utils/collaboration/useObserveYArtifactMeta';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';
import { ArtifactLinkDropdownMenu } from './ArtifactLinkContextMenu';
import { DropdownMenu } from '@radix-ui/themes';
import { openArtifactPrint } from '../../utils/openArtifactPrint';
import { duplicateArtifact } from '../../utils/localDb/duplicateArtifact';

interface Props {
  artifactId: string;
  triggerUndelete: () => void;
  connection: CollaborationManagerConnection;
  pane: PaneContextData['pane'];
  navigate: PaneContextData['navigate'];
  authorizedScope: CollaborationConnectionAuthorizedScope;
  children: React.ReactNode;
}

export const ArtifactDropdownMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = props;

  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { deletedAt } = useObserveYArtifactMeta(props.connection.yjsDoc);

  const onDuplicateArtifactClicked = async () => {
    const id = await duplicateArtifact(props.connection.yjsDoc).catch((e) => {
      handleTRPCErrors(e);
    });

    if (!id) {
      return;
    }

    navigate(PaneableComponent.Artifact, { id: id }, PaneTransition.NewTab);
  };

  const extraBefore = (
    <DropdownMenu.Group>
      <DropdownMenu.Item onClick={() => openArtifactPrint(props.artifactId)}>
        {t('contextMenu.printArtifact')}
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={onDuplicateArtifactClicked}>
        {t('contextMenu.duplicateArtifact')}
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  );
  const extraAfter = props.authorizedScope ===
    CollaborationConnectionAuthorizedScope.CoOwner &&
    deletedAt && (
      <DropdownMenu.Group>
        <DropdownMenu.Item onClick={props.triggerUndelete}>
          {t('artifact.deleted.undelete')}
        </DropdownMenu.Item>
      </DropdownMenu.Group>
    );

  return (
    <ArtifactLinkDropdownMenu
      artifactId={props.artifactId}
      paneId={pane.id}
      additionalContextMenuContentsBefore={extraBefore}
      additionalContextMenuContentsAfter={extraAfter}
    >
      {props.children}
    </ArtifactLinkDropdownMenu>
  );
};
