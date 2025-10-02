import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import type { PaneContextData } from '../../context/pane/PaneContext';
import { DropdownMenu } from '@radix-ui/themes';

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
  const [presentAlert] = useIonAlert();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const triggerRenameThreadAlert = async () => {
    presentAlert({
      subHeader: t('assistant.thread.rename'),
      buttons: [
        {
          text: t('generic.cancel'),
          role: 'cancel',
        },
        {
          text: t('generic.save'),
          role: 'save',
        },
      ],
      inputs: [
        {
          name: 'text',
          type: 'text',
          value: props.title,
        },
      ],
      onDidDismiss: async (result) => {
        const text = result.detail.data?.values.text;
        const role = result.detail.role;
        if (!text || text === props.title || role !== 'save') return;
        try {
          await trpc.ai.updateThread.mutate({
            id: props.id,
            title: text,
          });
          props.setTitle(text);
        } catch (error) {
          handleTRPCErrors(error);
        }
      },
    });
  };

  const triggerDeleteThreadAlert = async () => {
    presentAlert({
      subHeader: t('assistant.thread.delete.confirmation'),
      buttons: [
        {
          text: t('generic.cancel'),
          role: 'cancel',
        },
        {
          text: t('generic.confirm'),
          role: 'confirm',
          handler: () => {
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
      ],
    });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>{props.children}</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Root>
          <DropdownMenu.Item onClick={triggerRenameThreadAlert}>
            {t('assistant.thread.rename')}
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" onClick={triggerDeleteThreadAlert}>
            {t('assistant.thread.delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Root>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
