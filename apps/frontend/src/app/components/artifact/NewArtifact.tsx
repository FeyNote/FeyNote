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
  useIonViewDidEnter,
} from '@ionic/react';
import { t } from 'i18next';
import { routes } from '../../routes';
import { useContext } from 'react';
import { YManagerContext } from '../../context/yManager/YManagerContext';

export const NewArtifact: React.FC = () => {
  const router = useIonRouter();
  const { yManager } = useContext(YManagerContext);

  useIonViewDidEnter(() => {
    create();
  }, []);

  const create = async () => {
    const id = await yManager.createArtifact({
      title: 'Untitled',
      type: 'tiptap',
      theme: 'modern',
    });

    // We navigate to the created artifact but replace it in the browser history, so that
    // user does not get navigated back to this "create" page when pressing back.
    router.push(
      routes.artifact.build({
        id,
      }),
      'forward',
      'replace',
    );
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
