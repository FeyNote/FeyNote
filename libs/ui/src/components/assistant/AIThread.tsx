import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTextarea,
} from '@ionic/react';
import { send } from 'ionicons/icons';
import { useContext, useEffect, useState } from 'react';
import { Message, useChat } from 'ai/react';
import { SessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { PaneNav } from '../pane/PaneNav';
import { AIThreadOptionsPopover } from './AIThreadOptionsPopover';
import { useProgressBar } from '../../utils/useProgressBar';
import { useTranslation } from 'react-i18next';

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
  margin-right: 75px;
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
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const { startProgressBar, ProgressBar } = useProgressBar();
  const { session } = useContext(SessionContext);
  const { messages, setMessages, isLoading, input, setInput, append, reload } =
    useChat({
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
    setIsLoadingInitialState(true);
    const progress = startProgressBar();
    getThreadInfo().finally(() => {
      setIsLoadingInitialState(false);
      progress.dismiss();
    });
  }, []);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (
      e.key === 'Enter' &&
      e.shiftKey &&
      !isLoading &&
      !isLoadingInitialState
    ) {
      submitMessageQuery(input);
      setInput('');
    } else {
      setInput(e.currentTarget.value || '');
    }
  };

  const submitMessageQuery = async (query: string) => {
    const message = {
      content: query,
      role: 'user',
    };
    const newMessage = await trpc.ai.saveMessage.mutate({
      threadId: props.id,
      message,
    });
    append({
      content: query,
      role: 'user',
      id: newMessage.id,
    });
    await getThreadInfo();
  };

  const updateMessage = async (message: Message) => {
    await trpc.ai.updateMessage.mutate({
      threadId: props.id,
      message,
    });
    await trpc.ai.deleteMessageToId.mutate({
      id: message.id,
      threadId: props.id,
    });
    await getThreadInfo();
    reload();
  };

  const retryMessage = async (messageId: string) => {
    let retriedUserMsg,
      retriedUserMsgIdx = null;
    for (const [idx, message] of messages.entries()) {
      if (message.role === 'user') {
        retriedUserMsgIdx = idx;
        retriedUserMsg = message;
      }
      if (message.id === messageId) break;
    }
    if (retriedUserMsgIdx === null || !retriedUserMsg) return;
    const messageToDelete = messages.at(retriedUserMsgIdx + 1);
    if (!messageToDelete) return;
    await trpc.ai.deleteMessageToId.mutate({
      id: messageToDelete.id,
      threadId: props.id,
      inclusive: true,
    });
    const remainingMessages = messages.slice(0, retriedUserMsgIdx + 1);
    setMessages(remainingMessages);
    reload();
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
          {ProgressBar}
          {!messages.length ? (
            <div style={{ height: '100%' }}>
              {
                // TODO Chat Tutorial https://github.com/RedChickenCo/FeyNote/issues/86
              }
            </div>
          ) : (
            <AIMessagesContainer
              retryMessage={retryMessage}
              updateMessage={updateMessage}
              messages={messages}
              ongoingCommunication={isLoading}
            />
          )}
          <ChatTextContainer>
            <IonTextarea
              placeholder={t('assistant.thread.input.placeholder')}
              value={input}
              disabled={isLoading || isLoadingInitialState}
              onKeyUp={keyUpHandler}
            />
            <SendButtonContainer>
              <IonButton
                onClick={() => {
                  submitMessageQuery(input);
                  setInput('');
                }}
              >
                {isLoading || isLoadingInitialState ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <SendIcon icon={send} />
                )}
              </IonButton>
            </SendButtonContainer>
          </ChatTextContainer>
        </ChatContainer>
      </IonContent>
    </IonPage>
  );
};
