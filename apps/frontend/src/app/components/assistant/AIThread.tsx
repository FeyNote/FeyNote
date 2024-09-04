import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonTextarea,
} from '@ionic/react';
import { send } from 'ionicons/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useChat } from 'ai/react';
import { SessionContext } from '../../context/session/SessionContext';
import { FunctionName } from '@feynote/shared-utils';
import type { Message } from 'ai';
import { trpc } from '../../../utils/trpc';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { PaneNav } from '../pane/PaneNav';
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

interface Props {
  id: string;
}

export const AIThread: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useContext(SessionContext);
  const { messages, setMessages, input, setInput, append } = useChat({
    api: '/api/message/',
    headers: {
      Authorization: session?.token ? `Bearer ${session.token}` : '',
      'Content-Type': 'application/json',
    },
    generateId: () => {
      return crypto.randomUUID();
    },
    body: {
      threadId: props.id,
    },
    maxToolRoundtrips: 5,
    onFinish: async (message, options) => {
      if (
        options.finishReason === 'stop' ||
        options.finishReason === 'tool-calls'
      ) {
        await trpc.ai.saveMessage.mutate({
          threadId: props.id,
          message,
        });
      }
      if (options.finishReason === 'stop') {
        if (!title) {
          await trpc.ai.createThreadTitle.mutate({
            id: props.id,
          });

          await getThreadInfo();
        }
      }
    },
  });

  const messagesToRender = useMemo(() => {
    return messages.filter((message) => {
      const containsDisplayableToolCall =
        message.toolInvocations &&
        message.toolInvocations.find((toolCall) => {
          return Object.values<string>(FunctionName).includes(
            toolCall.toolName,
          );
        });
      return message.content || containsDisplayableToolCall;
    });
  }, [messages]);

  const getThreadInfo = async () => {
    const threadDTO = await trpc.ai.getThread.query({
      id: props.id,
    });
    const threadMessages = threadDTO.messages.map((message) => ({
      ...message.json,
      id: message.id,
    }));
    setMessages(threadMessages);
    setTitle(threadDTO.title || null);
  };

  useEffect(() => {
    setIsLoading(true);
    getThreadInfo().then(() => setIsLoading(false));
  }, []);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      submitUserQuery();
    } else {
      setInput(e.currentTarget.value || '');
    }
  };

  const submitUserQuery = async () => {
    const message = {
      content: input,
      role: 'user',
    } as Message;
    const response = await trpc.ai.saveMessage.mutate({
      threadId: props.id,
      message,
    });
    append({
      ...message,
      id: response.id,
    });
    setInput('');
  };

  const retryMessage = async (messageId: string) => {
    const userMessage = await trpc.ai.deleteMessageUntil.mutate({
      id: messageId,
      threadId: props.id,
    });
    await getThreadInfo();
    setInput(userMessage);
  };

  return (
    <IonPage>
      <PaneNav
        title={title || t('assistant.thread.emptyTitle')}
        popoverContents={
          <AIThreadOptionsPopover
            id={props.id}
            title={title || t('assistant.thread.emptyTitle')}
            setTitle={setTitle}
          />
        }
      />
      <IonContent>
        <ChatContainer>
          {!messages.length ? (
            <div style={{ height: '100%' }}>
              {
                // TODO Chat Tutorial https://github.com/RedChickenCo/FeyNote/issues/86
              }
            </div>
          ) : (
            <AIMessagesContainer
              retryMessage={retryMessage}
              messages={messagesToRender}
              disableRetry={isLoading}
            />
          )}
          <ChatTextContainer>
            <IonTextarea
              placeholder={t('assistant.thread.input.placeholder')}
              value={input}
              disabled={isLoading}
              onKeyUp={keyUpHandler}
            />
            <SendButtonContainer>
              <IonButton onClick={() => submitUserQuery()}>
                <SendIcon color="white" icon={send} />
              </IonButton>
            </SendButtonContainer>
          </ChatTextContainer>
        </ChatContainer>
      </IonContent>
    </IonPage>
  );
};
