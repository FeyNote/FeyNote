import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTextarea,
} from '@ionic/react';
import {
  pencilOutline,
  searchOutline,
  send,
  shirtOutline,
  skullOutline,
} from 'ionicons/icons';
import { useContext, useEffect, useState } from 'react';
import { Message, useChat } from 'ai/react';
import { SessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { PaneNav } from '../pane/PaneNav';
import { AIThreadOptionsPopover } from './AIThreadOptionsPopover';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { useTranslation } from 'react-i18next';
import { getApiUrls } from '../../utils/getApiUrls';
import { PaneContext } from '../../context/pane/PaneContext';
import { EventName } from '../../context/events/EventName';
import type { EventData } from '../../context/events/EventData';
import { eventManager } from '../../context/events/EventManager';

const StyledIonCardTitle = styled(IonCardTitle)`
  display: flex;
  align-items: center;
  justify-content: center;

  ion-icon {
    margin-right: 8px;
  }
`;

const StyledIonCardContent = styled(IonCardContent)`
  text-align: center;
`;

const OptionsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  ion-card {
    padding: 4px;
  }
`;

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
  margin-right: 8px;
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

const Prompt_Cards = [
  {
    header: 'thread.card.monster.header',
    query: 'thread.card.monster.query',
    icon: skullOutline,
  },
  {
    header: 'thread.card.item.header',
    query: 'thread.card.item.query',
    icon: shirtOutline,
  },
  {
    header: 'thread.card.scrape.header',
    query: 'thread.card.scrape.query',
    displayText: 'thread.card.scrape.displayText',
    icon: searchOutline,
  },
  {
    header: 'thread.card.format.header',
    query: 'thread.card.format.query',
    displayText: 'thread.card.format.displayText',
    icon: pencilOutline,
  },
];

interface Props {
  id: string;
}

export const AIThread: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);
  const [title, setTitle] = useState<string | null>(null);
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { session } = useContext(SessionContext);
  const { messages, setMessages, isLoading, input, setInput, append, reload } =
    useChat({
      api: `${getApiUrls().rest}/message/`,
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
      maxSteps: 1,
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
    const loadThreadInfo = async () => {
      setIsLoadingInitialState(true);
      const progress = startProgressBar();
      getThreadInfo().finally(() => {
        setIsLoadingInitialState(false);
        progress.dismiss();
      });
    };
    loadThreadInfo();

    const threadUpdateHandler = async (
      _: EventName,
      data: EventData[EventName.ThreadUpdated],
    ) => {
      if (data.threadId !== props.id) return;
      await loadThreadInfo();
    };

    eventManager.addEventListener(EventName.ThreadUpdated, threadUpdateHandler);
    return () => {
      eventManager.removeEventListener(
        EventName.ThreadUpdated,
        threadUpdateHandler,
      );
    };
  }, []);

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !isLoading &&
      !isLoadingInitialState
    ) {
      e.preventDefault(); // Prevents adding a newline
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
            navigate={navigate}
          />
        }
      />
      <IonContent>
        <ChatContainer>
          {ProgressBar}
          {!messages.length ? (
            <div style={{ height: '100%' }}>
              <OptionsList>
                {Prompt_Cards.map((card) => {
                  return (
                    <IonCard
                      button
                      onClick={() => {
                        setInput(t(card.query));
                      }}
                    >
                      <IonCardHeader>
                        <StyledIonCardTitle>
                          <IonIcon icon={card.icon} />
                          {t(card.header)}
                        </StyledIonCardTitle>
                      </IonCardHeader>
                      <StyledIonCardContent>
                        {t(card.displayText || card.query)}
                      </StyledIonCardContent>
                    </IonCard>
                  );
                })}
              </OptionsList>
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
