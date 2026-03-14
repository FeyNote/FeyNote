import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Flex } from '@radix-ui/themes';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { trpc } from '../../utils/trpc';
import { constructWorkspaceYDoc } from '@feynote/shared-utils';
import { encodeStateAsUpdate } from 'yjs';
import { useSessionContext } from '../../context/session/SessionContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useObserveWorkspaceMeta } from '../../utils/collaboration/useObserveWorkspaceMeta';
import { WorkspaceModalContent } from './WorkspaceModalContent';
import { WORKSPACE_COLORS } from './workspaceConstants';
import { getWorkspaceSnapshotStore } from '../../utils/localDb/workspaces/workspaceSnapshotStore';

export const WorkspaceCreateModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (workspaceId: string) => void;
}> = (props) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const { session } = useSessionContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const yDoc = useMemo(
    () =>
      constructWorkspaceYDoc({
        id: crypto.randomUUID(),
        userId: session.userId,
        name: '',
        color:
          WORKSPACE_COLORS[Math.floor(Math.random() * WORKSPACE_COLORS.length)],
      }),
    [session, props.open],
  );

  useEffect(() => {
    return () => {
      yDoc.destroy();
    };
  }, [yDoc]);

  const meta = useObserveWorkspaceMeta(yDoc);

  const close = () => props.onOpenChange(false);

  const createWorkspace = async () => {
    setSaving(true);

    const id = meta.id;
    if (!id) throw new Error('No ID on new workspace');

    try {
      const workspaceSnapshotStore = getWorkspaceSnapshotStore();
      const unlisten = workspaceSnapshotStore.listenForWorkspaceId(id, () => {
        unlisten();
        props.onCreated(id);
        close();
      });

      await trpc.workspace.createWorkspace.mutate({
        yBin: encodeStateAsUpdate(yDoc),
      });

      // Until we have local-first creation support, this is necessary
      setTimeout(unlisten, 30_000);
    } catch (e) {
      handleTRPCErrors(e);
    }

    setSaving(false);
  };

  return (
    <ActionDialog
      title={t('workspace.create')}
      open={props.open}
      onOpenChange={props.onOpenChange}
      size="large"
    >
      <WorkspaceModalContent yDoc={yDoc} />
      <Flex gap="3" mt="4" justify="end">
        <Button color="gray" onClick={close} disabled={saving}>
          {t('generic.cancel')}
        </Button>
        <Button
          onClick={createWorkspace}
          disabled={saving || !meta.name.trim()}
        >
          {t('workspace.create')}
        </Button>
      </Flex>
    </ActionDialog>
  );
};
