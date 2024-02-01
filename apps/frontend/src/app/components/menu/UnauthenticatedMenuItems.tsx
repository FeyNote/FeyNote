import { IonItem, IonLabel, IonMenuToggle } from '@ionic/react';
import { Routes } from '../../routes';
import { useTranslation } from 'react-i18next';

export const UnauthenticatedMenuItems: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Home}>
          <IonLabel>{t('menu.home')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Login}>
          <IonLabel>{t('menu.login')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Register}>
          <IonLabel>{t('menu.register')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </>
  );
};
