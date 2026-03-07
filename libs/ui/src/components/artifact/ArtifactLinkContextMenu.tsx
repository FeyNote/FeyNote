import { useTranslation } from 'react-i18next';
import { useArtifactDeleteOrRemoveSelfWithConfirmation } from './useArtifactDeleteOrRemoveSelf';
import { useMemo, useState } from 'react';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { ContextMenu, DropdownMenu } from '@radix-ui/themes';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { NewArtifactDialog } from './NewArtifactDialog';
import {
  APP_KEYBOARD_SHORTCUTS,
  getDesktopBrowserShortcutDisplayString,
} from '../../utils/keyboardShortcuts';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { WorkspacePickerDialog } from '../workspace/WorkspacePickerDialog';
import { withCollaborationConnection } from '../../utils/collaboration/collaborationManager';
import {
  getAccessLevelCanEdit,
  getWorkspaceAccessLevel,
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceTreeNodesFromYDoc,
} from '@feynote/shared-utils';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useAlertContext } from '../../context/alert/AlertContext';
import { addArtifactToWorkspaceWithSharingPrompt } from '../../utils/workspace/addArtifactToWorkspaceWithSharingPrompt';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useSessionContext } from '../../context/session/SessionContext';

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
  const { navigate } = useGlobalPaneContext();
  const [newArtifactDialogOpen, setNewArtifactDialogOpen] = useState(false);
  const [addToWorkspaceOpen, setAddToWorkspaceOpen] = useState(false);
  const [moveToWorkspaceOpen, setMoveToWorkspaceOpen] = useState(false);
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { workspaceSnapshot } = useWorkspaceSnapshot(currentWorkspaceId || '');
  const { editableWorkspaceSnapshots } = useWorkspaceSnapshots();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();
  const sessionContext = useSessionContext(true);
  const {
    deleteArtifactOrRemoveSelfWithConfirmation,
    deleteArtifactOrRemoveSelfWithConfirmationUI,
  } = useArtifactDeleteOrRemoveSelfWithConfirmation();
  const workspaceIsEditable = useMemo(() => {
    if (!currentWorkspaceId) return true;
    if (!workspaceSnapshot) return false;
    return getAccessLevelCanEdit(
      getWorkspaceAccessLevel(
        workspaceSnapshot,
        sessionContext?.session.userId,
      ),
    );
  }, [currentWorkspaceId, workspaceSnapshot, sessionContext?.session.userId]);

  const removeArtifactFromWorkspace = async (workspaceId: string) => {
    await withCollaborationConnection(
      `workspace:${workspaceId}`,
      async (connection) => {
        const artifacts = getWorkspaceArtifactsFromYDoc(connection.yjsDoc);
        const treeNodes = getWorkspaceTreeNodesFromYDoc(connection.yjsDoc);
        connection.yjsDoc.transact(() => {
          artifacts.delete(props.artifactId);
          treeNodes.delete(props.artifactId);
        });
      },
    );
  };

  const handleAddToWorkspace = async (workspaceId: string) => {
    await addArtifactToWorkspaceWithSharingPrompt({
      workspaceId,
      artifactId: props.artifactId,
      getPreference,
      setPreference,
      showAlert,
    });
  };

  const handleMoveToWorkspace = async (workspaceId: string) => {
    if (currentWorkspaceId) {
      await removeArtifactFromWorkspace(currentWorkspaceId);
    }
    await addArtifactToWorkspaceWithSharingPrompt({
      workspaceId,
      artifactId: props.artifactId,
      getPreference,
      setPreference,
      showAlert,
    });
  };

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
              shortcut={getDesktopBrowserShortcutDisplayString(
                APP_KEYBOARD_SHORTCUTS.splitRight.native,
                APP_KEYBOARD_SHORTCUTS.splitRight.browser,
              )}
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
              shortcut={getDesktopBrowserShortcutDisplayString(
                APP_KEYBOARD_SHORTCUTS.splitDown.native,
                APP_KEYBOARD_SHORTCUTS.splitDown.browser,
              )}
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
              shortcut={getDesktopBrowserShortcutDisplayString(
                APP_KEYBOARD_SHORTCUTS.newTab.native,
                APP_KEYBOARD_SHORTCUTS.newTab.browser,
              )}
            >
              {t('contextMenu.newTab')}
            </MenuImpl.Item>
          </MenuImpl.Group>
          <MenuImpl.Separator />
          <MenuImpl.Group>
            <MenuImpl.Item onClick={() => setNewArtifactDialogOpen(true)}>
              {t('artifactTree.newArtifactWithin')}
            </MenuImpl.Item>
            {workspaceIsEditable && editableWorkspaceSnapshots.length > 0 && (
              <MenuImpl.Item onClick={() => setAddToWorkspaceOpen(true)}>
                {t('workspace.addDocument')}
              </MenuImpl.Item>
            )}
            {workspaceIsEditable &&
              currentWorkspaceId &&
              editableWorkspaceSnapshots.length > 1 && (
                <MenuImpl.Item onClick={() => setMoveToWorkspaceOpen(true)}>
                  {t('workspace.moveDocument')}
                </MenuImpl.Item>
              )}
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
      <WorkspacePickerDialog
        open={addToWorkspaceOpen}
        onOpenChange={setAddToWorkspaceOpen}
        onSelect={handleAddToWorkspace}
        title={t('workspace.addDocument')}
      />
      <WorkspacePickerDialog
        open={moveToWorkspaceOpen}
        onOpenChange={setMoveToWorkspaceOpen}
        onSelect={handleMoveToWorkspace}
        title={t('workspace.moveDocument')}
        excludeWorkspaceIds={
          currentWorkspaceId ? new Set([currentWorkspaceId]) : undefined
        }
      />
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
