import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { pencil, trashBin } from 'ionicons/icons';
import {
  handleGenericError,
  handleTRPCErrors,
} from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import styled from 'styled-components';

const StyledParagraph = styled(IonLabel)`
  font-size: 0.75rem;
`;

interface Props {
  id: string;
  title: string;
}

export const ThreadOptionsPopover: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const router = useIonRouter();

  const deleteThread = async () => {
    try {
      await trpc.ai.deleteThread.mutate({
        id: props.id,
      });
      router.push(`ai`);
    } catch (error) {
      handleTRPCErrors(error, presentToast);
    }
  };

  return (
    <IonContent class="ion-padding">
      <IonItem button>
        <StyledParagraph>{t('assistant.chat.options.rename')}</StyledParagraph>
        <IonIcon id="thread-popover" slot="start" size="small" icon={pencil} />
      </IonItem>
      <IonItem color="danger" button onClick={() => deleteThread()}>
        <StyledParagraph>{t('assistant.chat.options.delete')}</StyledParagraph>
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
