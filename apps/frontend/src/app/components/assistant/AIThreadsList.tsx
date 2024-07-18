import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
  useIonRouter,
} from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { add, chatbubbles } from 'ionicons/icons';
import { AIThreadMenuItem } from './AIThreadMenuItem';
import { NullState } from '../info/NullState';
import { routes } from '../../routes';
import { ThreadDTO } from '@feynote/prisma/types';
import { useProgressBar } from '../../../utils/useProgressBar';

export const AIThreadsList: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const { startProgressBar, ProgressBar } = useProgressBar();

  const getUserThreads = () => {
    const progress = startProgressBar();
    trpc.ai.getThreads
      .query()
      .then((_threads) => {
        setThreads(_threads);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  const createNewThread = () => {
    const progress = startProgressBar();
    trpc.ai.createThread
      .mutate({})
      .then((thread) => {
        router.push(routes.assistantThread.build({ id: thread.id }));
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  useIonViewWillEnter(() => {
    getUserThreads();
  });

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
      <IonContent className="ion-padding">
        {ProgressBar}
        {!threads.length ? (
          <NullState
            className="ion-padding"
            title={t('assistant.threads.nullState.title')}
            message={t('assistant.threads.nullState.message')}
            icon={chatbubbles}
          />
        ) : (
          <IonList>
            {threads.map((thread) => {
              return <AIThreadMenuItem key={thread.id} thread={thread} />;
            })}
          </IonList>
        )}
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={createNewThread}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
