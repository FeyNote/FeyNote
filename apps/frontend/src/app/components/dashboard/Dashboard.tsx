import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useState } from 'react';
import { ArtifactSummary } from '@dnd-assistant/prisma';

export const Dashboard: React.FC = () => {
  const [presentToast] = useIonToast();
  const [artifacts, setArtifacts] = useState<ArtifactSummary[]>([]);

  useIonViewWillEnter(() => {
    trpc.artifact.getArtifactsForUser
      .query()
      .then((_artifacts) => {
        setArtifacts(_artifacts);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  });

  console.log('artifacts;', artifacts);

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton>New Artifact +</IonButton>
      </IonContent>
    </IonPage>
  );
};
