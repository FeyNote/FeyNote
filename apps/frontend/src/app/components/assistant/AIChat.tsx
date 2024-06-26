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
  useIonPopover,
  useIonToast,
  useIonViewWillEnter,
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
import { ThreadOptionsPopover } from './ThreadOptionsPopover';

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

const buildThreadOptionsPopover = (id: string, title: string) => {
  return () => <ThreadOptionsPopover id={id} title={title} />;
};

export const AIChat: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const { id } = useParams<RouteArgs['aiChat']>();
  const [showLoading, setShowLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [present, dismiss] = useIonPopover(
    buildThreadOptionsPopover(id, 'temp'),
    {
      onDismiss: () => dismiss(),
    },
  );

  useIonViewWillEnter(() => {
    getMessages().then(() => setShowLoading(false));
  });

  const getMessages = async () => {
    try {
      const threadMessages = await trpc.ai.getMessages.query({
        threadId: id,
      });
      setMessages(threadMessages);
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
      const newMessage = {
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
          console.log(`adding text: ${text}`);
          newMessage.content += text;
        }
        if (messages.length) messages.pop();
        setMessages([...messages, newMessage]);
      }
      getMessages();
      setDisableInput(false);
    } catch (error) {
      handleTRPCErrors(error, presentToast);
      setDisableInput(false);
    }
  };

  const sendMessage = (query: string) => {
    if (!message.trim()) return;
    const tempUserMessage = {
      id: 'temp',
      role: 'user',
      content: query,
    };
    setMessage('');
    setDisableInput(true);
    setMessages([...messages, tempUserMessage]);
    createMessage(query);
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
        getMessages();
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
          <IonButtons slot="end">
            <IonButton onClick={() => present()} color="primary">
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {showLoading && <IonProgressBar type="indeterminate" />}
        <ChatContainer>
          <ChatArea>
            {!messages.length ? (
              <NullState
                title={t('assistant.chat.nullState.title')}
                icon={chatbubbles}
              />
            ) : (
              <AIMessagesContainer messages={messages} />
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
