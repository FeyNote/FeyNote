import { IonLabel, IonList, IonListHeader, useIonToast } from '@ionic/react';
import { Thread } from '@prisma/client';
import styled from 'styled-components';
import { AIChatMenuItem } from './AIChatMenuItem';
import { trpc } from '../../../utils/trpc';
import {
  handleGenericError,
  handleTRPCErrors,
} from '../../../utils/handleTRPCErrors';

const ChatMenuContainer = styled.div`
  width: 100%;
  max-width: 250px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-right: 2px solid #222222;
`;

interface Props {
  threads: Thread[];
  setThreads: (threads: Thread[]) => void;
  selectedThread: Thread;
}

export const AIChatMenu: React.FC<Props> = ({
  threads,
  selectedThread,
  setThreads,
}) => {
  const [presentToast] = useIonToast();
  const updateThreadTitle = (id: string, title: string) => {
    trpc.ai.updateThread
      .query({
        id,
        title,
      })
      .then((_thread) => {
        const updatedThreadList = threads.map((thread) =>
          thread.id === _thread.id ? _thread : thread,
        );
        setThreads(updatedThreadList);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const deleteThread = (id: string) => {
    trpc.ai.deleteThread
      .query({
        id,
      })
      .then(() => {
        const updatedThreadList = threads.filter((thread) => thread.id !== id);
        setThreads(updatedThreadList);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
    <ChatMenuContainer className="ion-hide-md-down">
      <IonListHeader>
        <IonLabel>Threads</IonLabel>
      </IonListHeader>
      <IonList>
        {threads.map((thread, idx) => {
          const key = 'thread-menu-item' + idx;
          return (
            <AIChatMenuItem
              key={key}
              thread={thread}
              isSelected={thread.id === selectedThread.id}
              updateThreadTitle={updateThreadTitle}
              deleteThread={deleteThread}
            />
          );
        })}
      </IonList>
    </ChatMenuContainer>
  );
};
