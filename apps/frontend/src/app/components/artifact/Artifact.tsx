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
  useIonViewWillEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';

export const Artifact = () => {
  const [presentToast] = useIonToast();
  const [artifact, setArtifact] = useState<ArtifactDetail>();

  useIonViewWillEnter(() => {
    trpc.artifact.getArtifactById
      .query({
        id: 'asdf',
      })
      .then((_artifact) => {
        setArtifact(_artifact);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  });

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Artifact: {}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {artifact && <ArtifactRenderer artifact={artifact} />}
      </IonContent>
    </IonPage>
  );
};
