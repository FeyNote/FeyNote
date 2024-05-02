import { IonButton, IonIcon, IonTextarea, useIonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import styled from 'styled-components';
import { send, chatbubbles } from 'ionicons/icons';
import { NullState } from '../info/NullState';
import { AIMessagesContainer } from './AIMessagesContainer';
import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { Thread } from '@prisma/client';

const ChatContainer = styled.div`
  padding: 8px;
  display: flex;
  height: 100%;
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

interface Props {
  thread: Thread;
}

export const AIChatWindow = (props: Props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
    } else {
      const currentValue = e.currentTarget.value;
      if (currentValue && currentValue !== message) {
        setMessage(currentValue);
      }
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const query = {
      role: 'user',
      content: message,
    } satisfies ChatCompletionUserMessageParam;
    setMessage('');
    setMessages([...messages, query]);
    trpc.ai.sendMessage
      .query({
        message: query.content,
        threadId: props.thread.id,
      })
      .then((newMessages) => {
        setMessages([...messages, query, ...newMessages]);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
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
          onKeyUp={keyUpHandler}
        />
        <SendButtonContainer>
          <IonButton onClick={sendMessage}>
            <SendIcon color="white" icon={send} />
          </IonButton>
        </SendButtonContainer>
      </ChatTextContainer>
    </ChatContainer>
  );
};
