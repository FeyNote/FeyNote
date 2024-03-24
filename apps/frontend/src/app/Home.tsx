import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import React, { useContext, useEffect } from 'react';
import { SessionContext } from './context/session/SessionContext';
import { routes } from './routes';

export const Home: React.FC = () => {
  const { session } = useContext(SessionContext);
  const router = useIonRouter();

  useEffect(() => {
    if (session) {
      router.push(routes.dashboard.build());
    }
  }, [session, router]);

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        Tap the button in the toolbar to open the menu.
      </IonContent>
    </IonPage>
  );
};
