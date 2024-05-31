import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
  useIonViewDidLeave,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { ArtifactRenderer, EditArtifactDetail } from './ArtifactRenderer';
import { t } from 'i18next';
import { routes } from '../../routes';
import { useEffect, useRef, useState } from 'react';

export const NewArtifact: React.FC = () => {
  const [presentToast] = useIonToast();
  const router = useIonRouter();
  const selectTemplateModalShownRef = useRef(false);
  const presentSelectTemplateModalRef = useRef<() => void>();
  const [key, setKey] = useState(Math.random());

  useIonViewDidLeave(() => {
    setKey(Math.random()); // Reset form state when navigating
  }, []);

  useEffect(() => {
    if (!selectTemplateModalShownRef.current) {
      presentSelectTemplateModalRef.current?.();
      selectTemplateModalShownRef.current = true;
    }
  }, []);

  const newArtifactPlaceholder = {
    title: '',
    text: '',
    json: {},
    isTemplate: false,
    isPinned: false,
    rootTemplateId: null,
    artifactTemplate: null,
    templatedArtifacts: [],
    artifactReferences: [],
    incomingArtifactReferences: [],
  } satisfies EditArtifactDetail;

  const save = (updatedArtifact: EditArtifactDetail) => {
    trpc.artifact.createArtifact
      .mutate({
        title: updatedArtifact.title,
        json: updatedArtifact.json,
        text: updatedArtifact.text,
        isPinned: updatedArtifact.isPinned,
        isTemplate: updatedArtifact.isTemplate,
        rootTemplateId: updatedArtifact.rootTemplateId,
        artifactTemplateId: updatedArtifact.artifactTemplate?.id || null,
      })
      .then((response) => {
        const artifactId = response.id;
        // We navigate to the created artifact but replace it in the browser history, so that
        // user does not get navigated back to this "create" page when pressing back.
        router.push(
          routes.artifact.build({
            id: artifactId,
          }),
          'forward',
          'replace',
        );
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
        <ArtifactRenderer
          artifact={newArtifactPlaceholder}
          save={save}
          presentSelectTemplateModalRef={presentSelectTemplateModalRef}
          key={key} // Used to force react to treat this as a different component and reset the state
        />
      </IonContent>
    </IonPage>
  );
};
