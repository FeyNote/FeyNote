import {
  IonCard,
  IonContent,
  IonHeader,
  IonMenu,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React, { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { UnauthenticatedMenuItems } from './UnauthenticatedMenuItems';
import { AuthenticatedMenuItems } from './AuthenticatedMenuItems';
import { useTranslation } from 'react-i18next';

export const Menu: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);

  return (
    <IonMenu contentId="main" swipeGesture={false}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('menu.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          {session && <AuthenticatedMenuItems />}
          {!session && <UnauthenticatedMenuItems />}
        </IonCard>
      </IonContent>
    </IonMenu>
  );
};
