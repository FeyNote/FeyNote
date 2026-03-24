import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text } from '@radix-ui/themes';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { getWorkspaceAccessLevel } from '@feynote/shared-utils';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useObserveWorkspaceMeta } from '../../utils/collaboration/useObserveWorkspaceMeta';
import { useSessionContext } from '../../context/session/SessionContext';
import { useKnownUsers } from '../../utils/localDb/knownUsers/useKnownUsers';
import { useAcceptedIncomingSharedWorkspaceIds } from '../../utils/workspace/useAcceptedIncomingSharedWorkspaceIds';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { useArtifactSnapshotsForWorkspaceId } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshotsForWorkspaceId';
import * as Sentry from '@sentry/react';

export const WorkspaceSharedInfoModal: React.FC<{
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeft?: () => void;
}> = (props) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { getKnownUserById } = useKnownUsers();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [removingFromDocuments, setRemovingFromDocuments] = useState(false);
  const [removeDocsProgress, setRemoveDocsProgress] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);

  const workspaceConnection = useCollaborationConnection(
    `workspace:${props.workspaceId}`,
  );
  const { meta } = useObserveWorkspaceMeta(workspaceConnection.yjsDoc);

  const userTreeConnection = useCollaborationConnection(
    `userTree:${session.userId}`,
  );
  const { acceptedIncomingSharedWorkspaceIdsYKV } =
    useAcceptedIncomingSharedWorkspaceIds(userTreeConnection.yjsDoc);

  const { artifactSnapshotsForWorkspace } = useArtifactSnapshotsForWorkspaceId(
    props.workspaceId,
  );

  const accessLevel = getWorkspaceAccessLevel(
    workspaceConnection.yjsDoc,
    session.userId,
  );

  const close = () => props.onOpenChange(false);

  const handleLeave = async () => {
    try {
      await trpc.workspace.removeSelfAsCollaborator.mutate({
        workspaceId: props.workspaceId,
      });
      acceptedIncomingSharedWorkspaceIdsYKV.delete(props.workspaceId);

      setConfirmingLeave(false);
      close();
      props.onLeft?.();
    } catch (e) {
      handleTRPCErrors(e);
    }
  };

  const handleLeaveAndRemoveFromDocuments = async () => {
    try {
      await trpc.workspace.removeSelfAsCollaborator.mutate({
        workspaceId: props.workspaceId,
      });
      acceptedIncomingSharedWorkspaceIdsYKV.delete(props.workspaceId);
    } catch (e) {
      handleTRPCErrors(e);
      return;
    }

    setConfirmingLeave(false);
    setRemovingFromDocuments(true);
    setRemoveDocsProgress({ total: 0, success: 0, failed: 0 });

    const nonOwnedArtifacts = (artifactSnapshotsForWorkspace ?? []).filter(
      (snapshot) => snapshot.meta.userId !== session.userId,
    );

    let success = 0;
    let failed = 0;

    for (const snapshot of nonOwnedArtifacts) {
      try {
        await trpc.artifact.removeSelfAsCollaborator.mutate({
          artifactId: snapshot.id,
        });
        success++;
      } catch (e) {
        failed++;
        Sentry.captureException(e);
      }

      setRemoveDocsProgress({
        total: success + failed,
        success,
        failed,
      });
    }

    setRemovingFromDocuments(false);
  };

  const ownerName = meta.userId
    ? getKnownUserById(meta.userId)?.name
    : undefined;

  const getRemoveDocsDescription = () => {
    if (removingFromDocuments) {
      return t('workspaceInfo.leave.removeDocuments.progress', {
        count: removeDocsProgress?.total ?? 0,
      });
    }
    if (removeDocsProgress?.failed) {
      return t('workspaceInfo.leave.removeDocuments.doneWithErrors', {
        successCount: removeDocsProgress.success,
        failedCount: removeDocsProgress.failed,
      });
    }
    return t('workspaceInfo.leave.removeDocuments.done', {
      count: removeDocsProgress?.success ?? 0,
    });
  };

  const accessLevelKey =
    accessLevel === 'readonly'
      ? 'workspaceInfo.accessLevel.readonly'
      : 'workspaceInfo.accessLevel.readwrite';

  return (
    <ActionDialog
      title={t('workspaceInfo.title')}
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Flex align="center" gap="3" mb="3">
        <WorkspaceIconBubble icon={meta.icon} color={meta.color} size={40} />
        <Text size="4" weight="medium">
          {meta.name || t('workspace.untitled')}
        </Text>
      </Flex>

      <Flex direction="column" gap="1" mb="3">
        {ownerName && (
          <Text size="2" color="gray">
            {t('workspaceInfo.owner', { user: ownerName })}
          </Text>
        )}
        <Text size="2" color="gray">
          {t(accessLevelKey)}
        </Text>
      </Flex>

      <Flex gap="3" mt="4" justify="end">
        <Button
          color="red"
          variant="soft"
          onClick={() => setConfirmingLeave(true)}
        >
          {t('workspaceInfo.leave')}
        </Button>
        <Button onClick={close}>{t('generic.done')}</Button>
      </Flex>

      <ActionDialog
        title={t('workspaceInfo.leave')}
        description={t('workspaceInfo.leave.confirm')}
        open={confirmingLeave}
        onOpenChange={setConfirmingLeave}
        actionButtons={[
          {
            title: t('generic.cancel'),
            props: {
              color: 'gray',
              variant: 'soft',
            },
          },
          {
            title: t('workspaceInfo.leave.keepDocuments'),
            props: {
              color: 'red',
              onClick: handleLeave,
            },
          },
          {
            title: t('workspaceInfo.leave.removeDocuments'),
            props: {
              color: 'red',
              onClick: handleLeaveAndRemoveFromDocuments,
            },
          },
        ]}
      />

      <ActionDialog
        open={removeDocsProgress !== null}
        onOpenChange={(open) => {
          if (!open && !removingFromDocuments) {
            setRemoveDocsProgress(null);
            close();
            props.onLeft?.();
          }
        }}
        title={t('workspaceInfo.leave.removeDocuments.title')}
        description={getRemoveDocsDescription()}
        actionButtons={[
          {
            title: t('generic.close'),
            props: {
              disabled: removingFromDocuments,
              onClick: () => {
                setRemoveDocsProgress(null);
                close();
                props.onLeft?.();
              },
            },
          },
        ]}
      />
    </ActionDialog>
  );
};
