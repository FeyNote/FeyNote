import {
  AlertInput,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  UseIonRouterResult,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { pencil, trashBin } from 'ionicons/icons';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { routes } from '../../routes';
import { trpc } from '../../../utils/trpc';
import styled from 'styled-components';
import { useState } from 'react';

const StyledParagraph = styled(IonLabel)`
  font-size: 0.75rem;
`;

interface Props {
  id: string;
  title: string;
  router: UseIonRouterResult;
  setTitle: (title: string) => void;
}

export const AIThreadOptionsPopover: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const triggerAlert = async () => {
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

  const deleteThread = async () => {
    try {
      await trpc.ai.deleteThread.mutate({
        id: props.id,
      });
      props.router.push(routes.assistant.build());
    } catch (error) {
      handleTRPCErrors(error, presentToast);
    }
  };

  return (
    <IonContent class="ion-padding">
      <IonItem button onClick={triggerAlert}>
        <StyledParagraph>{t('assistant.thread.rename')}</StyledParagraph>
        <IonIcon id="thread-popover" slot="start" size="small" icon={pencil} />
      </IonItem>
      <IonItem color="danger" button onClick={() => deleteThread()}>
        <StyledParagraph>{t('assistant.thread.delete')}</StyledParagraph>
        <IonIcon
          id="thread-popover"
          slot="start"
          size="small"
          icon={trashBin}
        />
      </IonItem>
    </IonContent>
  );
};
