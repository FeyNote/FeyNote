import { useTranslation } from 'react-i18next';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { ContextMenu, DropdownMenu, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import { ActionDialog } from '../sharedComponents/ActionDialog';

export interface AIThreadMenuProps {
  id: string;
  title: string;
  paneId: string | undefined;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
  children: React.ReactNode;
}

const AIThreadMenuInternal: React.FC<
  AIThreadMenuProps & {
    MenuImpl: typeof ContextMenu | typeof DropdownMenu;
  }
> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useGlobalPaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [newTitle, setNewTitle] = useState(props.title);
  const [showRenameThreadAlert, setShowRenameThreadAlert] = useState(false);
  const [showDeleteThreadActionDialog, setShowDeleteThreadActionDialog] =
    useState(false);

  const MenuImpl = props.MenuImpl;

  const triggerRenameThreadAlert = () => {
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
                  props.onDelete();
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
                props.onTitleChange(newTitle.trim());
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
    <>
      <MenuImpl.Root>
        <MenuImpl.Trigger>{props.children}</MenuImpl.Trigger>
        <MenuImpl.Content>
          <MenuImpl.Item
            onClick={() =>
              navigate(
                props.paneId,
                PaneableComponent.AIThread,
                { id: props.id },
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
                PaneableComponent.AIThread,
                { id: props.id },
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
                PaneableComponent.AIThread,
                { id: props.id },
                PaneTransition.NewTab,
              )
            }
          >
            {t('contextMenu.newTab')}
          </MenuImpl.Item>
          <MenuImpl.Separator />
          <MenuImpl.Item onClick={triggerRenameThreadAlert}>
            {t('assistant.thread.rename')}
          </MenuImpl.Item>
          <MenuImpl.Item
            color="red"
            onClick={() => setShowDeleteThreadActionDialog(true)}
          >
            {t('assistant.thread.delete')}
          </MenuImpl.Item>
        </MenuImpl.Content>
      </MenuImpl.Root>
      {deleteThreadActionDialog}
      {renameThreadActionDialog}
    </>
  );
};

export const AIThreadContextMenu: React.FC<AIThreadMenuProps> = (props) => (
  <AIThreadMenuInternal {...props} MenuImpl={ContextMenu} />
);

export const AIThreadDropdownMenu: React.FC<AIThreadMenuProps> = (props) => (
  <AIThreadMenuInternal {...props} MenuImpl={DropdownMenu} />
);
