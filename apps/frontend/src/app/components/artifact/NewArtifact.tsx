import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonMenuButton,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
  useIonViewDidEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { ArtifactRenderer } from './ArtifactRenderer';
import { t } from 'i18next';
import { routes } from '../../routes';

export const NewArtifact: React.FC = () => {
  const [presentToast] = useIonToast();
  const router = useIonRouter();

  useIonViewDidEnter(() => {
    create();
  }, []);

  const create = () => {
    trpc.artifact.createArtifact
      .mutate({
        title: 'Untitled',
        json: {},
        text: '',
        theme: 'default',
        isPinned: false,
        isTemplate: false,
        rootTemplateId: null,
        artifactTemplateId: null,
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
        <IonItem className="ion-text-center">
          <IonSpinner></IonSpinner>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};
