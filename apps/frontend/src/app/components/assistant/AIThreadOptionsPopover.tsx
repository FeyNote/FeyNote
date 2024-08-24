import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { pencil, trashBin } from 'ionicons/icons';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { AIThreadsList } from './AIThreadsList';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';

interface Props {
  id: string;
  title: string;
  setTitle: (title: string) => void;
}

export const AIThreadOptionsPopover: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const { navigate } = useContext(PaneContext);

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
          handleTRPCErrors(error, presentToast);
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
          handler: async () => {
            try {
              await trpc.ai.deleteThread.mutate({
                id: props.id,
              });

              navigate(<AIThreadsList />, PaneTransition.Replace);
            } catch (error) {
              handleTRPCErrors(error, presentToast);
            }
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
