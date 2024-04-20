import { IonItem, IonLabel, IonMenuToggle } from '@ionic/react';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { routes } from '../../routes';
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
        <IonItem routerLink={routes.dashboard.build()}>
          <IonLabel>{t('menu.dashboard')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={routes.assistant.build()}>
          <IonLabel>{t('menu.assistant')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem onClick={signOut} routerLink={routes.login.build()}>
          <IonLabel>{t('menu.signOut')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </>
  );
};
