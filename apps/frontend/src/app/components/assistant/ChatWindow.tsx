import { IonButton, IonIcon, IonTextarea, useIonToast } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { MessageRole, Message } from '@feynote/shared-utils';
import styled from 'styled-components';
import { send, chatbubbles } from 'ionicons/icons';
import { NullState } from '../info/NullState';
import { MessagesContainer } from './MessagesContainer';

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

export const ChatWindow: React.FC = () => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [message, setMessage] = useState<Message>({
    content: '',
    role: MessageRole.User,
  });
  const [messages, setMessages] = useState<Message[]>([]);

  const enterKeyHandler = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const sendMessage = () => {
    const newMessages = [...messages, message];
    trpc.chat.sendMessage
      .query({
        messages: newMessages,
      })
      .then((_session) => {
        setMessages(newMessages);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  const messageInputHandler = (value: string) => {
    setMessage({
      content: value,
      role: MessageRole.User,
    });
  };

  return (
    <ChatContainer>
      <ChatArea>
        {!messages.length ? (
          <NullState
            title={t('assistant.chat.window.noChats.title')}
            message={t('assistant.chat.window.noChats.message')}
            icon={chatbubbles}
          />
        ) : (
          <MessagesContainer messages={messages} />
        )}
      </ChatArea>
      <ChatTextContainer>
        <IonTextarea
          placeholder={t('assistant.chat.input.placeholder')}
          value={message.content}
          onKeyDown={enterKeyHandler}
          onIonInput={(e) => messageInputHandler(e.target.value as string)}
        />
        <SendButtonContainer>
          <IonButton>
            <SendIcon color="white" icon={send} />
          </IonButton>
        </SendButtonContainer>
      </ChatTextContainer>
    </ChatContainer>
  );
};
