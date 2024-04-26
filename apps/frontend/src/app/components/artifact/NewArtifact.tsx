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
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { ArtifactRenderer, EditArtifactDetail } from './ArtifactRenderer';
import { t } from 'i18next';
import { routes } from '../../routes';

export const NewArtifact: React.FC = () => {
  const [presentToast] = useIonToast();
  const router = useIonRouter();

  const newArtifactPlaceholder = {
    id: '',
    userId: '',
    title: '',
    text: '',
    json: {},
    isTemplate: false,
    isPinned: false,
    rootTemplateId: null,
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
        <ArtifactRenderer artifact={newArtifactPlaceholder} save={save} />
      </IonContent>
    </IonPage>
  );
};
