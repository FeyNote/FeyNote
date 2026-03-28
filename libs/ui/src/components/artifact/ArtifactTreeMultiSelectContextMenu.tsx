import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContextMenu } from '@radix-ui/themes';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useSessionContext } from '../../context/session/SessionContext';
import {
  getAccessLevelCanEdit,
  getWorkspaceAccessLevel,
} from '@feynote/shared-utils';

export type MultiSelectAction = 'moveInTree' | 'removeFromWorkspace' | 'delete';

interface Props {
  enabled: boolean;
  selectedCount: number;
  onAction: (action: MultiSelectAction) => void;
  children: React.ReactNode;
}

export const ArtifactTreeMultiSelectContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { workspaceSnapshot } = useWorkspaceSnapshot(currentWorkspaceId || '');
  const sessionContext = useSessionContext(true);

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

  if (!props.enabled) {
    return props.children;
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>
          {t('artifactTree.multiSelect.label', {
            count: props.selectedCount,
          })}
        </ContextMenu.Label>
        <ContextMenu.Separator />
        {workspaceIsEditable && (
          <ContextMenu.Item onClick={() => props.onAction('moveInTree')}>
            {t('allArtifacts.actions.moveInTree')}
          </ContextMenu.Item>
        )}
        {workspaceIsEditable && currentWorkspaceId && (
          <ContextMenu.Item
            onClick={() => props.onAction('removeFromWorkspace')}
          >
            {t('workspace.removeDocument')}
          </ContextMenu.Item>
        )}
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" onClick={() => props.onAction('delete')}>
          {t('allArtifacts.actions.delete')}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};
