import { IonIcon, IonItem, IonLabel, useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { pencil, trashBin } from 'ionicons/icons';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

interface Props {
  id: string;
  title: string;
  setTitle: (title: string) => void;
}

export const AIThreadOptionsPopover: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const { navigate } = useContext(PaneContext);
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
    <>
      <IonItem button onClick={triggerRenameThreadAlert}>
        <IonLabel>{t('assistant.thread.rename')}</IonLabel>
        <IonIcon slot="start" size="small" icon={pencil} />
      </IonItem>
      <IonItem button onClick={triggerDeleteThreadAlert}>
        <IonLabel>{t('assistant.thread.delete')}</IonLabel>
        <IonIcon slot="start" size="small" icon={trashBin} />
      </IonItem>
    </>
  );
};
