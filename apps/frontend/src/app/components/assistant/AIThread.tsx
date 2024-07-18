import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonProgressBar,
  IonTextarea,
  IonTitle,
  IonToolbar,
  UseIonRouterResult,
  useIonPopover,
  useIonRouter,
  useIonToast,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { send, chatbubbles, ellipsisVertical } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { RouteArgs, routes } from '../../routes';
import {
  handleGenericError,
  handleTRPCErrors,
} from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SESSION_ITEM_NAME } from '../../context/session/types';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { AIThreadOptionsPopover } from './AIThreadOptionsPopover';

const ChatContainer = styled.div`
  padding: 8px;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
`;

const ChatTextContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
`;

const SendButtonContainer = styled.div`
  margin-left: 16px;
`;

const SendIcon = styled(IonIcon)`
  font-size: 24px;
`;

export interface ChatMessage {
  id: string;
  content: string;
  role: string;
}

const buildThreadOptionsPopover = ({
  id,
  title,
  setTitle,
  router,
}: {
  id: string;
  title: string;
  setTitle: (title: string) => void;
  router: UseIonRouterResult;
  dismiss: any;
}) => {
  return (
    <AIThreadOptionsPopover
      id={id}
      title={title}
      router={router}
      setTitle={setTitle}
    />
  );
};

export const AIThread: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const router = useIonRouter();
  const { id } = useParams<RouteArgs['assistantThread']>();
  const [showLoading, setShowLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [threadTitle, setThreadTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [tempUserMessage, setTempUserMessage] = useState<ChatMessage | null>(
    null,
  );
  const [tempAssistantMessage, setTempAssistantMessage] =
    useState<ChatMessage | null>(null);
  const [present, dismiss] = useIonPopover(buildThreadOptionsPopover, {
    id,
    title: threadTitle || t('assistant.thread.emptyTitle'),
    setTitle: setThreadTitle,
    router,
  });

  useIonViewWillEnter(() => {
    getThreadInfo().then(() => setShowLoading(false));
  });

  useIonViewWillLeave(() => {
    dismiss();
  });

  const getThreadInfo = async () => {
    try {
      const threadDTO = await trpc.ai.getThread.query({
        id,
      });
      setMessages(threadDTO.messages);
      setThreadTitle(threadDTO.title || null);
    } catch (error) {
      handleTRPCErrors(error, presentToast);
    }
  };

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage(message);
    } else {
      const currentValue = e.currentTarget.value;
      if (currentValue && currentValue !== message) {
        setMessage(currentValue);
      }
    }
  };

  const createMessage = async (query: string) => {
    const token = localStorage.getItem(SESSION_ITEM_NAME);
    const body = JSON.stringify({
      threadId: id,
      query,
    });
    try {
      const response = await fetch('/api/message/', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body,
      });
      const reader = response.body?.getReader();
      if (!reader) return;
      const tempMsg = {
        id: 'temp',
        role: 'assistant',
        content: '',
      };
      const decoder = new TextDecoder('utf-8');
      let streaming = true;
      while (streaming) {
        const { value, done } = await reader.read();
        if (done) {
          streaming = false;
        }
        const text = decoder.decode(value, { stream: true });
        if (text) {
          tempMsg.content += text;
          setTempAssistantMessage({
            ...tempMsg,
          });
        }
      }
      await getThreadInfo();
      setTempAssistantMessage(null);
      setDisableInput(false);
    } catch (error) {
      handleTRPCErrors(error, presentToast);
      setDisableInput(false);
    }
  };

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;
    const tmpMsg = {
      id: 'temp',
      role: 'user',
      content: query,
    };
    setMessage('');
    setTempUserMessage(tmpMsg);
    setDisableInput(true);
    await createMessage(query);
    setTempUserMessage(null);
  };

  const retryMessage = (messageId: string) => {
    // Delete Previous Message
    const messageCopyOrderByRecent = [...messages].reverse();
    const retryMessageIndex = messageCopyOrderByRecent.findIndex(
      (message) => message.id === messageId,
    );
    // Remove all messages sent since retry
    const remainingMessages = messageCopyOrderByRecent.slice(
      retryMessageIndex + 1,
    );
    const retriedUserMessage = remainingMessages.find(
      (message) => message.role === 'user',
    );
    if (!retriedUserMessage) {
      return handleGenericError(t('generic.error'), presentToast);
    }

    setMessages(remainingMessages.reverse());

    trpc.ai.deleteMessagesSince
      .mutate({
        messageId: retriedUserMessage.id,
        threadId: id,
      })
      .then(() => {
        // Resend User Prompt Previous Message
        createMessage(retriedUserMessage.content);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
        getThreadInfo();
      });
  };

  return (
    <IonPage id="main">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <>
              <IonBackButton defaultHref={routes.assistant.build()} />
              <IonMenuButton></IonMenuButton>
            </>
          </IonButtons>
          <IonTitle>{threadTitle || t('assistant.thread.emptyTitle')}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(event: any) => present({ event })}
            >
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showLoading && <IonProgressBar type="indeterminate" />}
        <ChatContainer>
          {!messages.length && !tempUserMessage && !tempAssistantMessage ? (
            <div style={{ height: '100%' }}>
              {
                // TODO https://github.com/RedChickenCo/FeyNote/issues/86
              }
            </div>
          ) : (
            <AIMessagesContainer
              retryMessage={retryMessage}
              messages={[...messages, tempUserMessage, tempAssistantMessage]}
            />
          )}
          <ChatTextContainer>
            <IonTextarea
              placeholder={t('assistant.thread.input.placeholder')}
              value={message}
              onKeyUp={(e) => keyUpHandler(e)}
              disabled={disableInput}
            />
            <SendButtonContainer>
              <IonButton onClick={() => sendMessage(message)}>
                <SendIcon color="white" icon={send} />
              </IonButton>
            </SendButtonContainer>
          </ChatTextContainer>
        </ChatContainer>
      </IonContent>
    </IonPage>
  );
};
