import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonTextarea,
  useIonToast,
} from '@ionic/react';
import { send } from 'ionicons/icons';
import {
  handleGenericError,
  handleTRPCErrors,
} from '../../../utils/handleTRPCErrors';
import { trpc } from '../../../utils/trpc';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { AIThreadOptionsPopover } from './AIThreadOptionsPopover';
import { appIdbStorageManager } from '../../../utils/AppIdbStorageManager';
import { PaneNav } from '../pane/PaneNav';

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

interface Props {
  id: string;
}

export const AIThread: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
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

  useEffect(() => {
    setShowLoading(true);

    getThreadInfo().then(() => setShowLoading(false));
  }, []);

  const getThreadInfo = async () => {
    try {
      const threadDTO = await trpc.ai.getThread.query({
        id: props.id,
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
    const session = await appIdbStorageManager.getSession();
    const body = JSON.stringify({
      threadId: props.id,
      query,
    });
    try {
      const response = await fetch('/api/message/', {
        method: 'POST',
        headers: {
          Authorization: session?.token ? `Bearer ${session.token}` : '',
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
        threadId: props.id,
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
    <IonPage>
      <PaneNav
        title={threadTitle || t('assistant.thread.emptyTitle')}
        popoverContents={
          <AIThreadOptionsPopover
            id={props.id}
            title={threadTitle || t('assistant.thread.emptyTitle')}
            setTitle={setThreadTitle}
          />
        }
      />
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
