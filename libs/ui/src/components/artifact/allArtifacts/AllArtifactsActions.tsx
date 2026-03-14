import { Button, DropdownMenu } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { MultiArtifactMoveInTreeDialog } from './MultiArtifactMoveInTreeDialog';
import { MultiArtifactDeleteDialog } from './MultiArtifactDeleteDialog';
import { MultiArtifactSharingDialog } from './MultiArtifactSharingDialog';
import { useWorkspaceSnapshot } from '../../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useWorkspaceSnapshots } from '../../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { useSessionContext } from '../../../context/session/SessionContext';
import { usePreferencesContext } from '../../../context/preferences/PreferencesContext';
import { useAlertContext } from '../../../context/alert/AlertContext';
import {
  getAccessLevelCanEdit,
  getWorkspaceAccessLevel,
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceTreeNodesFromYDoc,
  PreferenceNames,
  WorkspaceArtifactSharingMode,
} from '@feynote/shared-utils';
import { withCollaborationConnection } from '../../../utils/collaboration/collaborationManager';
import { addArtifactToWorkspaceWithSharingPrompt } from '../../../utils/workspace/addArtifactToWorkspaceWithSharingPrompt';
import { WorkspacePickerDialog } from '../../workspace/WorkspacePickerDialog';
import { ActionDialog } from '../../sharedComponents/ActionDialog';
import styled from 'styled-components';

const Container = styled.div`
  margin-left: auto;
`;

interface Props {
  selectedArtifactIds: ReadonlySet<string>;
  workspaceId: string | null;
}

export const AllArtifactsActions: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const sessionContext = useSessionContext(true);
  const { workspaceSnapshot } = useWorkspaceSnapshot(props.workspaceId || '');
  const { editableWorkspaceSnapshots } = useWorkspaceSnapshots();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();
  const workspaceIsEditable = useMemo(() => {
    if (!props.workspaceId) return true;
    if (!workspaceSnapshot) return false;
    return getAccessLevelCanEdit(
      getWorkspaceAccessLevel(
        workspaceSnapshot,
        sessionContext?.session.userId,
      ),
    );
  }, [props.workspaceId, workspaceSnapshot, sessionContext?.session.userId]);
  const workspaceArtifactIds = useMemo(() => {
    if (!props.workspaceId || !workspaceSnapshot) return null;
    return new Set(workspaceSnapshot.artifactIds);
  }, [props.workspaceId, workspaceSnapshot]);
  const hasSelectedArtifactsOutsideWorkspace = useMemo(() => {
    if (!workspaceArtifactIds) return false;
    for (const id of props.selectedArtifactIds) {
      if (!workspaceArtifactIds.has(id)) return true;
    }
    return false;
  }, [workspaceArtifactIds, props.selectedArtifactIds]);
  const [showMoveInTreeUi, setShowMoveInTreeUi] = useState(false);
  const [showSharingUi, setShowSharingUi] = useState(false);
  const [showDeleteUi, setShowDeleteUi] = useState(false);
  const [showPickerFor, setShowPickerFor] = useState<'add' | 'move' | null>(
    null,
  );
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [pendingSharingPrompt, setPendingSharingPrompt] = useState<{
    type: 'add' | 'move';
    targetWorkspaceId: string;
  } | null>(null);
  const [resultStats, setResultStats] = useState<{
    workingSetSize: number;
    total: number;
    success: number;
    failed: number;
  }>();

  const runBulkAddOrMove = async (
    type: 'add' | 'move',
    targetWorkspaceId: string,
    sharingMode: WorkspaceArtifactSharingMode,
  ) => {
    const size = props.selectedArtifactIds.size;
    setResultStats({ workingSetSize: size, total: 0, success: 0, failed: 0 });

    if (type === 'move' && props.workspaceId) {
      await withCollaborationConnection(
        `workspace:${props.workspaceId}`,
        async (connection) => {
          const artifacts = getWorkspaceArtifactsFromYDoc(connection.yjsDoc);
          const treeNodes = getWorkspaceTreeNodesFromYDoc(connection.yjsDoc);
          connection.yjsDoc.transact(() => {
            for (const artifactId of props.selectedArtifactIds) {
              artifacts.delete(artifactId);
              treeNodes.delete(artifactId);
            }
          });
        },
      );
    }

    let successCount = 0;
    let failedCount = 0;
    for (const artifactId of props.selectedArtifactIds) {
      try {
        await addArtifactToWorkspaceWithSharingPrompt({
          workspaceId: targetWorkspaceId,
          artifactId,
          getPreference,
          setPreference,
          showAlert,
          overrideSharingMode: sharingMode,
        });
        successCount++;
      } catch (e) {
        failedCount++;
        Sentry.captureException(e);
      }
      setResultStats({
        workingSetSize: size,
        total: successCount + failedCount,
        success: successCount,
        failed: failedCount,
      });
    }
  };

  const handleWorkspaceSelected = (
    type: 'add' | 'move',
    targetWorkspaceId: string,
  ) => {
    setShowPickerFor(null);
    const mode = getPreference(PreferenceNames.WorkspaceArtifactSharingMode);
    if (mode === WorkspaceArtifactSharingMode.Always) {
      runBulkAddOrMove(
        type,
        targetWorkspaceId,
        WorkspaceArtifactSharingMode.Always,
      );
    } else if (mode === WorkspaceArtifactSharingMode.Never) {
      runBulkAddOrMove(
        type,
        targetWorkspaceId,
        WorkspaceArtifactSharingMode.Never,
      );
    } else {
      setPendingSharingPrompt({ type, targetWorkspaceId });
    }
  };

  const handleSharingPromptResponse = (share: boolean) => {
    if (!pendingSharingPrompt) return;
    const sharingMode = share
      ? WorkspaceArtifactSharingMode.Always
      : WorkspaceArtifactSharingMode.Never;
    setPendingSharingPrompt(null);
    runBulkAddOrMove(
      pendingSharingPrompt.type,
      pendingSharingPrompt.targetWorkspaceId,
      sharingMode,
    );
  };

  const handleBulkRemoveFromWorkspace = async () => {
    if (!props.workspaceId) return;
    const size = props.selectedArtifactIds.size;
    setShowRemoveConfirm(false);
    setResultStats({ workingSetSize: size, total: 0, success: 0, failed: 0 });

    try {
      await withCollaborationConnection(
        `workspace:${props.workspaceId}`,
        async (connection) => {
          const artifacts = getWorkspaceArtifactsFromYDoc(connection.yjsDoc);
          const treeNodes = getWorkspaceTreeNodesFromYDoc(connection.yjsDoc);
          connection.yjsDoc.transact(() => {
            for (const artifactId of props.selectedArtifactIds) {
              artifacts.delete(artifactId);
              treeNodes.delete(artifactId);
            }
          });
        },
      );
      setResultStats({
        workingSetSize: size,
        total: size,
        success: size,
        failed: 0,
      });
    } catch (e) {
      Sentry.captureException(e);
      setResultStats({
        workingSetSize: size,
        total: size,
        success: 0,
        failed: size,
      });
    }
  };

  const propsWorkspaceIdAsSet = useMemo(
    () => (props.workspaceId ? new Set([props.workspaceId]) : undefined),
    [props.workspaceId],
  );

  return (
    <Container>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={!props.selectedArtifactIds.size}>
          <Button variant="soft">
            {t('allArtifacts.actions')}
            <DropdownMenu.TriggerIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            onClick={() => setShowMoveInTreeUi(true)}
            disabled={
              !workspaceIsEditable || hasSelectedArtifactsOutsideWorkspace
            }
          >
            {t('allArtifacts.actions.moveInTree')}
          </DropdownMenu.Item>
          {workspaceIsEditable && editableWorkspaceSnapshots.length > 0 && (
            <DropdownMenu.Item onClick={() => setShowPickerFor('add')}>
              {t('workspace.addDocument')}
            </DropdownMenu.Item>
          )}
          {workspaceIsEditable &&
            props.workspaceId &&
            editableWorkspaceSnapshots.length > 1 && (
              <DropdownMenu.Item
                onClick={() => setShowPickerFor('move')}
                disabled={hasSelectedArtifactsOutsideWorkspace}
              >
                {t('workspace.moveDocument')}
              </DropdownMenu.Item>
            )}
          {workspaceIsEditable && props.workspaceId && (
            <DropdownMenu.Item
              onClick={() => setShowRemoveConfirm(true)}
              disabled={hasSelectedArtifactsOutsideWorkspace}
            >
              {t('workspace.removeDocument')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item onClick={() => setShowSharingUi(true)}>
            {t('allArtifacts.actions.manageSharing')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={() => setShowDeleteUi(true)} color="red">
            {t('allArtifacts.actions.delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {showMoveInTreeUi && (
        <MultiArtifactMoveInTreeDialog
          artifactIds={props.selectedArtifactIds}
          workspaceId={props.workspaceId}
          close={() => setShowMoveInTreeUi(false)}
        />
      )}
      {showDeleteUi && (
        <MultiArtifactDeleteDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowDeleteUi(false)}
        />
      )}
      {showSharingUi && (
        <MultiArtifactSharingDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowSharingUi(false)}
        />
      )}
      <WorkspacePickerDialog
        open={showPickerFor === 'add'}
        onOpenChange={(open) => {
          if (!open) setShowPickerFor(null);
        }}
        onSelect={(workspaceId) => handleWorkspaceSelected('add', workspaceId)}
        title={t('workspace.addDocument')}
        excludeWorkspaceIds={propsWorkspaceIdAsSet}
        mustBeEditable={true}
      />
      <WorkspacePickerDialog
        open={showPickerFor === 'move'}
        onOpenChange={(open) => {
          if (!open) setShowPickerFor(null);
        }}
        onSelect={(workspaceId) => handleWorkspaceSelected('move', workspaceId)}
        title={t('workspace.moveDocument')}
        excludeWorkspaceIds={propsWorkspaceIdAsSet}
        mustBeEditable={true}
      />
      {showRemoveConfirm && (
        <ActionDialog
          title={t('allArtifacts.actions.removeFromWorkspace.confirm.title')}
          description={t(
            'allArtifacts.actions.removeFromWorkspace.confirm.message',
            { count: props.selectedArtifactIds.size },
          )}
          open={true}
          onOpenChange={(open) => {
            if (!open) setShowRemoveConfirm(false);
          }}
          actionButtons={[
            {
              title: t('generic.cancel'),
              props: {
                color: 'gray',
                onClick: () => setShowRemoveConfirm(false),
              },
            },
            {
              title: t('generic.confirm'),
              props: {
                onClick: handleBulkRemoveFromWorkspace,
              },
            },
          ]}
        />
      )}
      {pendingSharingPrompt && (
        <ActionDialog
          title={t('allArtifacts.actions.workspaceSharing.confirm.title')}
          description={t(
            'allArtifacts.actions.workspaceSharing.confirm.message',
          )}
          open={true}
          onOpenChange={(open) => {
            if (!open) setPendingSharingPrompt(null);
          }}
          actionButtons={[
            {
              title: t('generic.no'),
              props: {
                color: 'gray',
                onClick: () => handleSharingPromptResponse(false),
              },
            },
            {
              title: t('generic.yes'),
              props: {
                onClick: () => handleSharingPromptResponse(true),
              },
            },
          ]}
        />
      )}
      {resultStats && (
        <ActionDialog
          title={t('allArtifacts.actions.workspaceAction.processing.title')}
          description={`${t(
            'allArtifacts.actions.workspaceAction.processing.message',
            {
              totalCount: resultStats.workingSetSize,
              successCount: resultStats.success,
            },
          )} ${
            resultStats.failed
              ? t(
                  'allArtifacts.actions.workspaceAction.processing.message.failed',
                  { count: resultStats.failed },
                )
              : ''
          }`}
          open={true}
          onOpenChange={() => {
            if (resultStats.total === resultStats.workingSetSize) {
              setResultStats(undefined);
            }
          }}
          actionButtons={[
            {
              title: t('generic.close'),
              props: {
                onClick: () => setResultStats(undefined),
                disabled: resultStats.total !== resultStats.workingSetSize,
              },
            },
          ]}
        />
      )}
    </Container>
  );
};
