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
} from '@ionic/react';
import { Routes } from '../../routes';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';

export const Dashboard: React.FC = () => {
  const [presentToast] = useIonToast();
  const getUserArtifactsQuery = trpc.artifact.getAllForUser.useQuery(
    undefined,
    {
      retry: false,
      onError: (error) => {
        handleTRPCErrors(error.data?.httpStatus, presentToast);
      },
    }
  );

  console.log(getUserArtifactsQuery.data);

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
        <IonButton routerLink={Routes.NewArtifact}>New Artifact +</IonButton>
      </IonContent>
    </IonPage>
  );
};
