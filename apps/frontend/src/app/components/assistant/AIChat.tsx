import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { AIChatWindow } from './AIChatWindow';
import { useParams } from 'react-router-dom';
import { RouteArgs } from '../../routes';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { useState } from 'react';
import { Thread } from '@prisma/client';
import { useTranslation } from 'react-i18next';

export const AIChat = () => {
  const { t } = useTranslation();
  const { id } = useParams<RouteArgs['aiChat']>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [presentToast] = useIonToast();
  const [showLoading, setShowLoading] = useState(false);

  useIonViewWillEnter(() => {
    getUserThreads();
  });

  const getUserThreads = () => {
    setShowLoading(true);
    trpc.ai.getThread
      .query({ id })
      .then((_thread) => {
        setThread(_thread);
        setShowLoading(false);
      })
      .catch((error) => {
        setShowLoading(false);
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          {<IonTitle>{t('assistant.chat.title')}</IonTitle>}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showLoading && <IonProgressBar type="indeterminate" />}
        {thread && <AIChatWindow thread={thread} />}
      </IonContent>
    </IonPage>
  );
};
