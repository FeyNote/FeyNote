import {
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
import { NullState } from '../info/NullState';
import { useParams } from 'react-router-dom';
import { RouteArgs } from '../../routes';
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

const ChatArea = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  border-bottom: 2px solid #222222;
  align-items: center;
  justify-content: center;
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

export const AIChat: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const router = useIonRouter();
  const { id } = useParams<RouteArgs['assistantChat']>();
  const [showLoading, setShowLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [threadTitle, setThreadTitle] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [tempUserMessage, setTempUserMessage] = useState<ChatMessage | null>(
    null,
  );
  const [tempAssistantMessage, setTempAssistantMessage] =
    useState<ChatMessage | null>(null);
  const [present, dismiss] = useIonPopover(buildThreadOptionsPopover, {
    id,
    title: threadTitle,
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
      setThreadTitle(threadDTO.title);
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
    if (!message.trim()) return;
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
    const messageCopyByRecent = [...messages].reverse();
    const regeneratedIndex = messageCopyByRecent.findIndex(
      (message) => message.id === messageId,
    );
    const remainingMessages = messageCopyByRecent.slice(regeneratedIndex);
    const mostRecentUserMessage = remainingMessages.find(
      (message) => message.role === 'user',
    );
    if (!mostRecentUserMessage) {
      return handleGenericError(
        t('assistant.chat.retry.genericerror'),
        presentToast,
      );
    }

    setMessages(remainingMessages);

    trpc.ai.deleteMessage
      .mutate({
        messageId,
        threadId: id,
      })
      .then(() => {
        // Resend User Prompt Previous Message
        sendMessage(mostRecentUserMessage?.content);
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
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          {<IonTitle>{t('assistant.title')}</IonTitle>}
          <IonButtons slot="end">
            <IonButton
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(event: any) => present({ event })}
              color="primary"
            >
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showLoading && <IonProgressBar type="indeterminate" />}
        <ChatContainer>
          <ChatArea>
            {!messages.length && !tempUserMessage && !tempAssistantMessage ? (
              <NullState
                title={t('assistant.chat.nullState.title')}
                icon={chatbubbles}
              />
            ) : (
              <AIMessagesContainer
                messages={[...messages, tempUserMessage, tempAssistantMessage]}
              />
            )}
          </ChatArea>
          <ChatTextContainer>
            <IonTextarea
              placeholder={t('assistant.chat.input.placeholder')}
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
