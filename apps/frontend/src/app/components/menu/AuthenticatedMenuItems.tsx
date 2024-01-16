import { IonItem, IonLabel, IonMenuToggle } from '@ionic/react';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { Routes } from '../../routes';

export const AuthenticatedMenuItems: React.FC = () => {
  const { setSession } = useContext(SessionContext);

  const signOut = () => {
    setSession(null);
  };

  return (
    <>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Dashboard}>
          <IonLabel>Dashboard</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem onClick={signOut} routerLink={Routes.Login}>
          <IonLabel>Sign Out</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </>
  );
};
