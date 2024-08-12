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
import { send, ellipsisVertical } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { RouteArgs, routes } from '../../routes';
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
import type { ThreadDTOMessage } from '@feynote/prisma/types';
import type { ChatCompletionAssistantMessageParam } from 'openai/resources';
import { OpenAIStreamReader } from './OpenAIStreamReader';
import { appIdbStorageManager } from '../../../utils/AppIdbStorageManager';

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
  const [presentToast] = useIonToast();
  const router = useIonRouter();
  const { id } = useParams<RouteArgs['assistantThread']>();
  const [showLoading, setShowLoading] = useState(true);
  const [query, setQuery] = useState<string>('');
  const [threadTitle, setThreadTitle] = useState<string | null>(null);
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [messages, setMessages] = useState<ThreadDTOMessage[]>([]);
  const [streamReader, setStreamReader] = useState<OpenAIStreamReader | null>(
    null,
  );
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
      sendMessage(query);
    } else {
      const currentValue = e.currentTarget.value;
      if (currentValue && currentValue !== query) {
        setQuery(currentValue);
      }
    }
  };

  useEffect(() => {
    if (!streamReader) return;
    const newAssistantMessageHandler = () => {
      console.log('New assistant message');
      setMessages([
        ...messages,
        {
          id: 'temp',
          json: {
            role: 'assistant',
            content: '',
          },
        },
      ]);
    };
    const newAssistantMessageContentHandler = (content: string) => {
      console.log('Adding on string to message;', content);
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((message) => message.json.role === 'assistant');
      if (!lastAssistantMessage) return console.log('Ahhh');
      setMessages([
        ...messages.slice(0, messages.length - 1),
        {
          id: 'temp',
          json: {
            role: 'assistant',
            content: lastAssistantMessage.json.content + content,
          },
        },
      ]);
    };
    const newToolCallsHandler = (
      toolcallMessage: ChatCompletionAssistantMessageParam,
    ) => {
      console.log('New tool call message;', toolcallMessage);
      setMessages([...messages, { id: 'temp', json: toolcallMessage }]);
    };
    const finishHandler = async () => {
      console.log('Finished!');
      await getThreadInfo();
      setDisableInput(false);
    };
    streamReader.on('newAssistantMessage', newAssistantMessageHandler);
    streamReader.on(
      'newAssistantMessageContent',
      newAssistantMessageContentHandler,
    );
    streamReader.on('newToolCalls', newToolCallsHandler);
    streamReader.on('finish', finishHandler);
    return () => {
      streamReader.off('newAssistantMessage', newAssistantMessageHandler);
      streamReader.off(
        'newAssistantMessageContent',
        newAssistantMessageContentHandler,
      );
      streamReader.off('newToolCalls', newToolCallsHandler);
      streamReader.off('finish', finishHandler);
    };
  }, [streamReader, messages]);

  const createMessage = async (query: string) => {
    const session = await appIdbStorageManager.getSession();
    const body = JSON.stringify({
      threadId: id,
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
      const streamReader = new OpenAIStreamReader(reader);
      setStreamReader(streamReader);
    } catch (error) {
      handleTRPCErrors(error, presentToast);
      setDisableInput(false);
    }
  };

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;
    const userMessage = {
      id: 'temp',
      json: {
        role: 'user',
        content: query,
      },
    } as ThreadDTOMessage;
    setMessages([...messages, userMessage]);
    setQuery('');
    setDisableInput(true);
    await createMessage(query);
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
      (message) => message.json.role === 'user',
    );
    const retriedUserQuery = retriedUserMessage?.json.content as string;
    if (!retriedUserMessage || !retriedUserQuery) {
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
        createMessage(retriedUserQuery);
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
          {!messages.length ? (
            <div style={{ height: '100%' }}>
              {
                // TODO Chat Tutorial https://github.com/RedChickenCo/FeyNote/issues/86
              }
            </div>
          ) : (
            <AIMessagesContainer
              retryMessage={retryMessage}
              messages={messages}
            />
          )}
          <ChatTextContainer>
            <IonTextarea
              placeholder={t('assistant.thread.input.placeholder')}
              value={query}
              onKeyUp={(e) => keyUpHandler(e)}
              disabled={disableInput}
            />
            <SendButtonContainer>
              <IonButton onClick={() => sendMessage(query)}>
                <SendIcon color="white" icon={send} />
              </IonButton>
            </SendButtonContainer>
          </ChatTextContainer>
        </ChatContainer>
      </IonContent>
    </IonPage>
  );
};
