import { useTranslation } from 'react-i18next';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import type { PaneContextData } from '../../context/pane/PaneContext';
import { DropdownMenu, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { ActionDialog } from '../sharedComponents/ActionDialog';

interface Props {
  id: string;
  title: string;
  setTitle: (title: string) => void;
  navigate: PaneContextData['navigate'];
  children: React.ReactNode;
}

export const AIThreadOptionsPopover: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = props;
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [newTitle, setNewTitle] = useState(props.title);
  const [showRenameThreadAlert, setShowRenameThreadAlert] = useState(false);
  const [showDeleteThreadActionDialog, setShowDeleteThreadActionDialog] =
    useState(false);

  const triggerRenameThreadAlert = async () => {
    setNewTitle(props.title);
    setShowRenameThreadAlert(true);
  };

  const deleteThreadActionDialog = (
    <ActionDialog
      title={t('assistant.thread.delete.confirmation')}
      open={showDeleteThreadActionDialog}
      onOpenChange={setShowDeleteThreadActionDialog}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('generic.delete'),
          props: {
            color: 'red',
            onClick: () => {
              trpc.ai.deleteThread
                .mutate({
                  id: props.id,
                })
                .then(() => {
                  navigate(
                    PaneableComponent.AIThreadsList,
                    {},
                    PaneTransition.Replace,
                  );
                })
                .catch((error) => {
                  handleTRPCErrors(error);
                });
            },
          },
        },
      ]}
    />
  );

  const renameThreadActionDialog = (
    <ActionDialog
      title={t('assistant.thread.rename')}
      open={showRenameThreadAlert}
      onOpenChange={setShowRenameThreadAlert}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            onClick: async () => {
              if (!newTitle.trim() || newTitle === props.title) return;

              try {
                await trpc.ai.updateThread.mutate({
                  id: props.id,
                  title: newTitle.trim(),
                });
                props.setTitle(newTitle.trim());
              } catch (error) {
                handleTRPCErrors(error);
              }
            },
          },
        },
      ]}
    >
      <TextField.Root
        value={newTitle}
        onChange={(event) => {
          setNewTitle(event.target.value);
        }}
        placeholder={t('assistant.thread.rename')}
        autoFocus={true}
      />
    </ActionDialog>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{props.children}</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Root>
          <DropdownMenu.Item onClick={triggerRenameThreadAlert}>
            {t('assistant.thread.rename')}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            color="red"
            onClick={() => setShowDeleteThreadActionDialog(true)}
          >
            {t('assistant.thread.delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Root>
      </DropdownMenu.Content>
      {deleteThreadActionDialog}
      {renameThreadActionDialog}
    </DropdownMenu.Root>
  );
};
