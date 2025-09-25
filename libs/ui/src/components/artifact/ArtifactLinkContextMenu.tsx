import { useTranslation } from 'react-i18next';
import { useArtifactDeleteOrRemoveSelfWithConfirmation } from './useArtifactDeleteOrRemoveSelf';
import { useContext, useState } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { ContextMenu } from '@radix-ui/themes';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { NewArtifactDialog } from './NewArtifactDialog';

export interface ArtifactLinkContextMenuProps {
  artifactId: string;
  artifactBlockId?: string;
  artifactDate?: string;
  paneId: string | undefined;
  children: React.ReactNode;
  additionalContextMenuContentsBefore?: React.ReactNode;
  additionalContextMenuContentsAfter?: React.ReactNode;
}

/**
 * A reusable context menu that can be used anywhere that links to an artifact, and contains standard operations that one would perform
 */
export const ArtifactLinkContextMenu: React.FC<ArtifactLinkContextMenuProps> = (
  props,
) => {
  const { t } = useTranslation();
  const { navigate } = useContext(GlobalPaneContext);
  const [newArtifactDialogOpen, setNewArtifactDialogOpen] = useState(false);

  const {
    deleteArtifactOrRemoveSelfWithConfirmation,
    deleteArtifactOrRemoveSelfWithConfirmationUI,
  } = useArtifactDeleteOrRemoveSelfWithConfirmation();

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>
        <ContextMenu.Content>
          {props.additionalContextMenuContentsBefore}
          <ContextMenu.Group>
            <ContextMenu.Item
              onClick={() =>
                navigate(
                  props.paneId,
                  PaneableComponent.Artifact,
                  {
                    id: props.artifactId,
                  },
                  PaneTransition.HSplit,
                )
              }
            >
              {t('contextMenu.splitRight')}
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() =>
                navigate(
                  props.paneId,
                  PaneableComponent.Artifact,
                  {
                    id: props.artifactId,
                  },
                  PaneTransition.VSplit,
                )
              }
            >
              {t('contextMenu.splitDown')}
            </ContextMenu.Item>
            <ContextMenu.Item
              onClick={() =>
                navigate(
                  props.paneId,
                  PaneableComponent.Artifact,
                  {
                    id: props.artifactId,
                  },
                  PaneTransition.NewTab,
                )
              }
            >
              {t('contextMenu.newTab')}
            </ContextMenu.Item>
          </ContextMenu.Group>
          <ContextMenu.Separator />
          <ContextMenu.Group>
            <ContextMenu.Item onClick={() => setNewArtifactDialogOpen(true)}>
              {t('artifactTree.newArtifactWithin')}
            </ContextMenu.Item>
            <ContextMenu.Item
              color={'red'}
              onClick={() => {
                deleteArtifactOrRemoveSelfWithConfirmation(props.artifactId);
              }}
            >
              {t('contextMenu.deleteArtifact')}
            </ContextMenu.Item>
          </ContextMenu.Group>
          {props.additionalContextMenuContentsAfter}
        </ContextMenu.Content>
      </ContextMenu.Root>
      <NewArtifactDialog
        open={newArtifactDialogOpen}
        onOpenChange={(open) => setNewArtifactDialogOpen(open)}
        tree={{
          parentArtifactId: props.artifactId,
          order: 'X',
        }}
      />
      {deleteArtifactOrRemoveSelfWithConfirmationUI}
    </>
  );
};
