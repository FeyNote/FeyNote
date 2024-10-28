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
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { trpc } from '../../utils/trpc';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { useContext } from 'react';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

const Container = styled.div`
  position: relative;

  min-height: 100%;
  padding-bottom: 50px;
`;

const CardListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;

  ion-card {
    min-width: 200px;
    flex: 1 1 0px;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
`;

const PaddedLabelContainer = styled.div`
  padding: 16px;
`;

interface Props {
  dismiss: () => void;
}

export const WelcomeModal: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(GlobalPaneContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const newArtifact = () => {
    trpc.artifact.createArtifact
      .mutate({
        title: t('generic.untitled'),
        type: 'tiptap',
        theme: 'default',
      })
      .then((artifact) => {
        props.dismiss();
        navigate(
          undefined, // Navigate within current focused pane rather than specific pane
          PaneableComponent.Artifact,
          {
            id: artifact.id,
          },
          PaneTransition.Push,
        );
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  };

  const newAIThread = () => {
    trpc.ai.createThread
      .mutate({})
      .then((thread) => {
        props.dismiss();
        navigate(
          undefined,
          PaneableComponent.AIThread,
          { id: thread.id },
          PaneTransition.Push,
        );
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  };

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
        <Container>
          <PaddedLabelContainer>
            <IonLabel>{t('welcome.subtitle')}</IonLabel>
          </PaddedLabelContainer>
          <CardListContainer>
            <IonCard href="https://feynote.com/documentation" target="_blank">
              <IonCardHeader>
                <IonCardTitle>{t('welcome.docs.title')}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>{t('welcome.docs.description')}</IonCardContent>
            </IonCard>
            <IonCard onClick={newArtifact} button>
              <IonCardHeader>
                <IonCardTitle>{t('welcome.artifact.title')}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {t('welcome.artifact.description')}
              </IonCardContent>
            </IonCard>
            <IonCard onClick={props.dismiss} button>
              <IonCardHeader>
                <IonCardTitle>{t('welcome.dashboard.title')}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {t('welcome.dashboard.description')}
              </IonCardContent>
            </IonCard>
            <IonCard onClick={newAIThread} button>
              <IonCardHeader>
                <IonCardTitle>{t('welcome.ai.title')}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>{t('welcome.ai.description')}</IonCardContent>
            </IonCard>
          </CardListContainer>
          <Footer>
            <PaddedLabelContainer>
              <IonLabel>
                <p>{t('welcome.footer')}</p>
              </IonLabel>
            </PaddedLabelContainer>
          </Footer>
        </Container>
      </IonContent>
    </IonPage>
  );
};
