import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Flex } from '@radix-ui/themes';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { getWorkspaceMetaYKVFromYDoc } from '@feynote/shared-utils';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useObserveWorkspaceMeta } from '../../utils/collaboration/useObserveWorkspaceMeta';
import { WorkspaceModalContent } from './WorkspaceModalContent';

export const WorkspaceEditModal: React.FC<{
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}> = (props) => {
  const { t } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const connection = useCollaborationConnection(
    `workspace:${props.workspaceId}`,
  );

  const { meta } = useObserveWorkspaceMeta(connection.yjsDoc);

  const close = () => props.onOpenChange(false);

  const handleDelete = () => {
    const yKeyValue = getWorkspaceMetaYKVFromYDoc(connection.yjsDoc);
    yKeyValue.set('deletedAt', Date.now());
    setConfirmingDelete(false);
    close();
    props.onDeleted?.();
  };

  const handleRestore = () => {
    const yKeyValue = getWorkspaceMetaYKVFromYDoc(connection.yjsDoc);
    yKeyValue.set('deletedAt', null);
  };

  return (
    <ActionDialog
      title={t('workspace.edit')}
      open={props.open}
      onOpenChange={props.onOpenChange}
      size="large"
    >
      <WorkspaceModalContent yDoc={connection.yjsDoc} />
      <Flex gap="3" mt="4" justify="end">
        {meta.deletedAt ? (
          <Button color="red" variant="soft" onClick={handleRestore}>
            {t('workspace.undelete')}
          </Button>
        ) : (
          <Button
            color="red"
            variant="soft"
            onClick={() => setConfirmingDelete(true)}
          >
            {t('workspace.delete')}
          </Button>
        )}
        <Button onClick={close}>{t('generic.done')}</Button>
      </Flex>

      <ActionDialog
        title={t('workspace.delete')}
        description={t('workspace.delete.confirm')}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
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
              onClick: handleDelete,
            },
          },
        ]}
      />
    </ActionDialog>
  );
};
