import { IonItem, IonLabel, IonMenuToggle } from '@ionic/react';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { Routes } from '../../routes';
import { useTranslation } from 'react-i18next';

export const AuthenticatedMenuItems: React.FC = () => {
  const { t } = useTranslation();
  const { setSession } = useContext(SessionContext);

  const signOut = () => {
    setSession(null);
  };

  return (
    <>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Dashboard}>
          <IonLabel>{t('menu.dashboard')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem onClick={signOut} routerLink={Routes.Login}>
          <IonLabel>{t('menu.signOut')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </>
  );
};
