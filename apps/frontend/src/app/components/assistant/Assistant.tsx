import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useTranslation } from 'react-i18next';
import { ThreadMenu } from "./ThreadMenu";
import { ChatWindow } from "./ChatWindow";

export const Assistant: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('assistant.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ChatWindow />
      </IonContent>
    </IonPage>
  );
};
