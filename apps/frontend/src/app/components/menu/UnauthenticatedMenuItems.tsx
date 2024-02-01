import { IonItem, IonLabel, IonMenuToggle } from '@ionic/react';
import { Routes } from '../../routes';
import { useTranslation } from 'react-i18next';

export const UnauthenticatedMenuItems: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Home}>
          <IonLabel>{t('menu.label.home')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Login}>
          <IonLabel>{t('menu.label.login')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
      <IonMenuToggle autoHide={false}>
        <IonItem routerLink={Routes.Register}>
          <IonLabel>{t('menu.label.register')}</IonLabel>
        </IonItem>
      </IonMenuToggle>
    </>
  );
};
