import { IonItem, IonLabel, IonMenuToggle } from '@ionic/react';
import { routes } from '../../routes';
import { useTranslation } from 'react-i18next';

export const UnauthenticatedMenuItems: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={routes.home.build()}>
          <IonLabel>{t('menu.home')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={routes.login.build()}>
          <IonLabel>{t('menu.login')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={routes.register.build()}>
          <IonLabel>{t('menu.register')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </>
  );
};
