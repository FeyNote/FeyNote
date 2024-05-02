import { ArtifactDetail } from '@feynote/prisma/types';
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
import { ArtifactRenderer, EditArtifactDetail } from './ArtifactRenderer';
import { RouteArgs } from '../../routes';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';

export const Artifact: React.FC = () => {
  const { id } = useParams<RouteArgs['artifact']>();
  const [presentToast] = useIonToast();
  const [artifact, setArtifact] = useState<ArtifactDetail>();

  const load = () => {
    trpc.artifact.getArtifactById
      .query({
        id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  useIonViewWillEnter(() => {
    load();
  });

  const save = (updatedArtifact: EditArtifactDetail) => {
    if (!artifact) return;

    trpc.artifact.updateArtifact
      .mutate({
        id: artifact.id,
        title: updatedArtifact.title,
        json: updatedArtifact.json,
        text: updatedArtifact.text,
        isPinned: updatedArtifact.isPinned,
        isTemplate: updatedArtifact.isTemplate,
        rootTemplateId: updatedArtifact.rootTemplateId,
        artifactTemplateId:
          'artifactTemplate' in updatedArtifact &&
          updatedArtifact.artifactTemplate
            ? updatedArtifact.artifactTemplate.id
            : null,
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        load();
      });
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>
            {t('artifact.title')}: {artifact?.title}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {artifact && <ArtifactRenderer artifact={artifact} save={save} />}
      </IonContent>
    </IonPage>
  );
};
