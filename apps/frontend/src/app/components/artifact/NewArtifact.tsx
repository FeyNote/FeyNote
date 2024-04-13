import { ArtifactDetail } from '@dnd-assistant/prisma/types';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { ArtifactRenderer, EditArtifactDetail } from './ArtifactRenderer';
import { t } from 'i18next';

export const NewArtifact: React.FC = () => {
  const [presentToast] = useIonToast();

  const newArtifactPlaceholder = {
    id: '',
    userId: '',
    title: '',
    text: '',
    json: {},
    isTemplate: false,
    isPinned: false,
  } satisfies EditArtifactDetail;

  const save = (updatedArtifact: Partial<ArtifactDetail>) => {
    const { title, json, text } = updatedArtifact;
    if (!title?.trim() || !json || !text?.trim()) {
      // TODO: Error messaging
      return;
    }

    trpc.artifact.createArtifact
      .mutate({
        title,
        json,
        text,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('newArtifact.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <ArtifactRenderer artifact={newArtifactPlaceholder} save={save} />
      </IonContent>
    </IonPage>
  );
};
