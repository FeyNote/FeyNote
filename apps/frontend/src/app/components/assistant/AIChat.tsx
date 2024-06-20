import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { AIChatWindow } from './AIChatWindow';
import { useParams } from 'react-router-dom';
import { RouteArgs } from '../../routes';
import {
  handleGenericError,
  handleTRPCErrors,
} from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { useState } from 'react';
import { Thread } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AIChatMenu } from './AIChatMenu';

const FlexContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const AIChat: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<RouteArgs['aiChat']>();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [thread, setThread] = useState<Thread | null>();
  const [showLoading, setShowLoading] = useState(false);
  const [presentToast] = useIonToast();
  const router = useIonRouter();

  useIonViewWillEnter(() => {
    getUserThreads();
  });

  const getUserThreads = () => {
    setShowLoading(true);
    trpc.ai.getThreads
      .query()
      .then((_threads) => {
        setThreads(_threads);
        const selectedThread = _threads.find((thread) => thread.id === id);
        if (!selectedThread) {
          handleGenericError('An unexpected error has occurred', presentToast);
          router.goBack();
        }
        setThread(selectedThread);
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
        {thread && (
          <FlexContainer>
            <AIChatMenu
              selectedThread={thread}
              threads={threads}
              setThreads={setThreads}
            />
            <AIChatWindow thread={thread} />
          </FlexContainer>
        )}
      </IonContent>
    </IonPage>
  );
};
