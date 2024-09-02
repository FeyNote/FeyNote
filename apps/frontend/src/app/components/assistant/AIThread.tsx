import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  UseIonRouterResult,
  useIonPopover,
  useIonRouter,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { send, ellipsisVertical } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { RouteArgs, routes } from '../../routes';
import { trpc } from '../../../utils/trpc';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { AIThreadOptionsPopover } from './AIThreadOptionsPopover';
import { useChat } from 'ai/react';
import { SessionContext } from '../../context/session/SessionContext';
import { FunctionName } from '@feynote/shared-utils';
import type { Message } from 'ai';

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
  const router = useIonRouter();
  const { id } = useParams<RouteArgs['assistantThread']>();
  const [title, setTitle] = useState<string | null>(null);
  const [present, dismiss] = useIonPopover(buildThreadOptionsPopover, {
    id,
    title: title || t('assistant.thread.emptyTitle'),
    setTitle,
    router,
  });
  const { session } = useContext(SessionContext);
  const { messages, setMessages, input, setInput, append, isLoading } = useChat(
    {
      api: '/api/message/',
      headers: {
        Authorization: session?.token ? `Bearer ${session.token}` : '',
        'Content-Type': 'application/json',
      },
      generateId: () => {
        return crypto.randomUUID();
      },
      body: {
        threadId: id,
      },
      maxToolRoundtrips: 5,
      onFinish: async (message, options) => {
        if (
          options.finishReason === 'stop' ||
          options.finishReason === 'tool-calls'
        ) {
          await trpc.ai.saveMessage.mutate({
            threadId: id,
            message,
          });
        }
        if (options.finishReason === 'stop') {
          if (!title) {
            await trpc.ai.createThreadTitle.mutate({
              id,
            });

            await getThreadInfo();
          }
        }
      },
    },
  );

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

  useIonViewWillEnter(() => {
    getThreadInfo();
  });

  useIonViewWillLeave(() => {
    dismiss();
  });

  const getThreadInfo = async () => {
    const threadDTO = await trpc.ai.getThread.query({
      id,
    });
    const threadMessages = threadDTO.messages.map((message) => ({
      ...message.json,
      id: message.id,
    }));
    setMessages(threadMessages);
    setTitle(threadDTO.title || null);
  };

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
      threadId: id,
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
      threadId: id,
    });
    await getThreadInfo();
    setInput(userMessage);
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
          <IonTitle>{title || t('assistant.thread.emptyTitle')}</IonTitle>
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
          <form onSubmit={submitUserQuery}>
            <ChatTextContainer>
              <IonTextarea
                placeholder={t('assistant.thread.input.placeholder')}
                value={input}
                disabled={isLoading}
                onKeyUp={keyUpHandler}
              />
              <SendButtonContainer>
                <button type="submit">
                  <SendIcon color="white" icon={send} />
                </button>
              </SendButtonContainer>
            </ChatTextContainer>
          </form>
        </ChatContainer>
      </IonContent>
    </IonPage>
  );
};
