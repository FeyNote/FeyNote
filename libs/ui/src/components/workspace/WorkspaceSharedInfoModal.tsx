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

  const workspaceConnection = useCollaborationConnection(
    `workspace:${props.workspaceId}`,
  );
  const meta = useObserveWorkspaceMeta(workspaceConnection.yjsDoc);

  const userTreeConnection = useCollaborationConnection(
    `userTree:${session.userId}`,
  );
  const { acceptedIncomingSharedWorkspaceIdsYKV } =
    useAcceptedIncomingSharedWorkspaceIds(userTreeConnection.yjsDoc);

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

  const ownerName = meta.userId
    ? getKnownUserById(meta.userId)?.name
    : undefined;

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
            title: t('generic.confirm'),
            props: {
              color: 'red',
              onClick: handleLeave,
            },
          },
        ]}
      />
    </ActionDialog>
  );
};
