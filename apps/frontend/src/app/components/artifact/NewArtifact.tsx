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
  useIonToast,
  useIonViewDidEnter,
} from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { t } from 'i18next';
import { useContext } from 'react';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { PaneContext } from '../../context/pane/PaneContext';
import { Artifact } from './Artifact';
import { PaneTransition } from '../../context/paneControl/PaneControlContext';

export const NewArtifact: React.FC = () => {
  const [presentToast] = useIonToast();
  const { navigate } = useContext(PaneContext);
  const { eventManager } = useContext(EventContext);

  useIonViewDidEnter(() => {
    create();
  }, []);

  const create = () => {
    trpc.artifact.createArtifact
      .mutate({
        title: 'Untitled',
        type: 'tiptap',
        json: {},
        text: '',
        theme: 'default',
        isPinned: false,
        isTemplate: false,
        rootTemplateId: null,
        artifactTemplateId: null,
      })
      .then((response) => {
        // We navigate to the created artifact but replace it in the browser history, so that
        // user does not get navigated back to this "create" page when pressing back.
        navigate(<Artifact id={response.id} />, PaneTransition.Replace);

        eventManager.broadcast([EventName.ArtifactCreated]);
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
