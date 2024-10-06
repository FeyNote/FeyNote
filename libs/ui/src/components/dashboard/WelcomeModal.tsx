import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const CardListContainer = styled.div`
  display: flex;
`;

interface Props {
  dismiss: () => void;
}

export const WelcomeModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('welcome.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={props.dismiss}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <CardListContainer>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('welcome.docs.title')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>{t('welcome.docs.description')}</IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('welcome.artifact.title')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>{t('welcome.artifact.description')}</IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{t('welcome.dashboard.title')}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {t('welcome.dashboard.description')}
            </IonCardContent>
          </IonCard>
        </CardListContainer>
      </IonContent>
    </IonPage>
  );
};
