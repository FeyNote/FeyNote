import { useTranslation } from 'react-i18next';
import { useArtifactDeleteOrRemoveSelfWithConfirmation } from './useArtifactDeleteOrRemoveSelf';
import { useContext, useState } from 'react';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { ContextMenu, DropdownMenu } from '@radix-ui/themes';
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

const ArtifactLinkMenuInternal: React.FC<
  ArtifactLinkContextMenuProps & {
    MenuImpl: typeof ContextMenu | typeof DropdownMenu;
  }
> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(GlobalPaneContext);
  const [newArtifactDialogOpen, setNewArtifactDialogOpen] = useState(false);

  const {
    deleteArtifactOrRemoveSelfWithConfirmation,
    deleteArtifactOrRemoveSelfWithConfirmationUI,
  } = useArtifactDeleteOrRemoveSelfWithConfirmation();

  const MenuImpl = props.MenuImpl;

  return (
    <>
      <MenuImpl.Root>
        <MenuImpl.Trigger>{props.children}</MenuImpl.Trigger>
        <MenuImpl.Content>
          {props.additionalContextMenuContentsBefore}
          <MenuImpl.Group>
            <MenuImpl.Item
              onClick={() =>
                navigate(
                  props.paneId,
                  PaneableComponent.Artifact,
                  {
                    id: props.artifactId,
                    focusBlockId: props.artifactBlockId,
                    focusDate: props.artifactDate,
                  },
                  PaneTransition.HSplit,
                )
              }
            >
              {t('contextMenu.splitRight')}
            </MenuImpl.Item>
            <MenuImpl.Item
              onClick={() =>
                navigate(
                  props.paneId,
                  PaneableComponent.Artifact,
                  {
                    id: props.artifactId,
                    focusBlockId: props.artifactBlockId,
                    focusDate: props.artifactDate,
                  },
                  PaneTransition.VSplit,
                )
              }
            >
              {t('contextMenu.splitDown')}
            </MenuImpl.Item>
            <MenuImpl.Item
              onClick={() =>
                navigate(
                  props.paneId,
                  PaneableComponent.Artifact,
                  {
                    id: props.artifactId,
                    focusBlockId: props.artifactBlockId,
                    focusDate: props.artifactDate,
                  },
                  PaneTransition.NewTab,
                )
              }
            >
              {t('contextMenu.newTab')}
            </MenuImpl.Item>
          </MenuImpl.Group>
          <MenuImpl.Separator />
          <MenuImpl.Group>
            <MenuImpl.Item onClick={() => setNewArtifactDialogOpen(true)}>
              {t('artifactTree.newArtifactWithin')}
            </MenuImpl.Item>
            <MenuImpl.Item
              color={'red'}
              onClick={() => {
                deleteArtifactOrRemoveSelfWithConfirmation(props.artifactId);
              }}
            >
              {t('contextMenu.deleteArtifact')}
            </MenuImpl.Item>
          </MenuImpl.Group>
          {props.additionalContextMenuContentsAfter}
        </MenuImpl.Content>
      </MenuImpl.Root>
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

/**
 * A reusable context menu that can be used anywhere that links to an artifact, and contains standard operations that one would perform
 */
export const ArtifactLinkContextMenu: React.FC<ArtifactLinkContextMenuProps> = (
  props,
) => <ArtifactLinkMenuInternal {...props} MenuImpl={ContextMenu} />;

/**
 * A reusable dropdown menu that can be used anywhere that links to an artifact, and contains standard operations that one would perform
 */
export const ArtifactLinkDropdownMenu: React.FC<
  ArtifactLinkContextMenuProps
> = (props) => <ArtifactLinkMenuInternal {...props} MenuImpl={DropdownMenu} />;
