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
  IonProgressBar,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { Thread } from '@prisma/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { add, chatbubbles } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { AIThread } from './AIThread';
import { NullState } from '../info/NullState';
import styled from 'styled-components';

const ThreadsContainer = styled(IonList)`
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  height: 100%;
`;

export const AIThreadsMenu: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [showLoading, setShowLoading] = useState(false);

  const getUserThreads = () => {
    setShowLoading(true);
    trpc.ai.getThreads
      .query()
      .then((_threads) => {
        setThreads(_threads);
        setShowLoading(false);
      })
      .catch((error) => {
        setShowLoading(false);
        handleTRPCErrors(error, presentToast);
      });
  };

  const createNewThread = () => {
    setShowLoading(true);
    trpc.ai.createThread
      .query()
      .then((thread) => {
        router.push(`ai/${thread.id}`);
        setShowLoading(false);
      })
      .catch((error) => {
        setShowLoading(false);
        handleTRPCErrors(error, presentToast);
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
          <IonTitle>{t('assistant.threads.title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showLoading && <IonProgressBar type="indeterminate" />}
        <ThreadsContainer>
          {!threads.length ? (
            <NullState
              title={t('assistant.threads.nullState.title')}
              message={t('assistant.threads.nullState.message')}
              icon={chatbubbles}
            />
          ) : (
            <IonList>
              {threads.map((thread, idx) => (
                <AIThread key={thread.title + idx} thread={thread} />
              ))}
            </IonList>
          )}
        </ThreadsContainer>
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={createNewThread}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
