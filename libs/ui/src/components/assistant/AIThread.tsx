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
  useIonAlert,
} from '@ionic/react';
import {
  pencilOutline,
  searchOutline,
  send,
  shirtOutline,
  skullOutline,
} from 'ionicons/icons';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
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
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { DefaultChatTransport } from 'ai';
import type { FeynoteUIMessage } from '@feynote/shared-utils';

const EmptyMessageContainer = styled.div`
  height: 100%;
`;

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

const PROMPT_CARDS = [
  {
    header: 'aiThread.card.scrape.header',
    query: 'aiThread.card.scrape.query',
    displayText: 'aiThread.card.scrape.displayText',
    icon: searchOutline,
  },
  {
    header: 'aiThread.card.format.header',
    query: 'aiThread.card.format.query',
    displayText: 'aiThread.card.format.displayText',
    icon: pencilOutline,
  },
  {
    header: 'aiThread.card.monster.header',
    query: 'aiThread.card.monster.query',
    icon: skullOutline,
  },
  {
    header: 'aiThread.card.item.header',
    query: 'aiThread.card.item.query',
    icon: shirtOutline,
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
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [presentAlert] = useIonAlert();
  const textAreaRef = useRef<HTMLIonTextareaElement>(null);
  const [input, setInput] = useState('');
  const { messages, setMessages, status, sendMessage, regenerate } =
    useChat<FeynoteUIMessage>({
      transport: new DefaultChatTransport({
        api: `${getApiUrls().rest}/message/`,
        headers: {
          Authorization: session?.token ? `Bearer ${session.token}` : '',
          'Content-Type': 'application/json',
        },
        body: {
          threadId: props.id,
        },
      }),
      generateId: () => {
        return crypto.randomUUID();
      },
      onFinish: async (data) => {
        //TODO: https://github.com/RedChickenCo/FeyNote/issues/1201
        await trpc.ai.saveMessage.mutate({
          threadId: props.id,
          message: data.message,
        });
        if (!title) {
          await trpc.ai.createThreadTitle.mutate({
            id: props.id,
          });
          await getThreadInfo();
        }
      },
      onError: (error) => {
        try {
          // Vercel does not expose the status code on the error property, only via its message object
          const status = JSON.parse(error.message).status;
          if (status === 429) {
            presentAlert({
              header: t('aiThread.createMessage.error.rateLimit.header'),
              message: t('aiThread.createMessage.error.rateLimit.message'),
              buttons: [t('generic.okay')],
            });
            return;
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
        handleTRPCErrors(new Error());
      },
    });
  const isLoading = useMemo(
    () => status === 'submitted' || status === 'streaming',
    [status],
  );
  const getThreadInfo = async () => {
    const threadDTO = await trpc.ai.getThread.query({
      id: props.id,
    });
    setMessages(threadDTO.messages);
    setTitle(threadDTO.title || null);
  };

  useEffect(() => {
    const progress = startProgressBar();
    setIsLoadingInitialState(true);
    getThreadInfo().finally(() => {
      setIsLoadingInitialState(false);
      progress.dismiss();
    });

    const threadUpdateHandler = async (
      _: EventName,
      data: EventData[EventName.ThreadUpdated],
    ) => {
      if (data.threadId !== props.id) return;
      await getThreadInfo();
    };

    eventManager.addEventListener(EventName.ThreadUpdated, threadUpdateHandler);
    return () => {
      eventManager.removeEventListener(
        EventName.ThreadUpdated,
        threadUpdateHandler,
      );
    };
  }, []);

  const submitMessageQuery = async () => {
    const message: FeynoteUIMessage = {
      id: crypto.randomUUID(),
      parts: [{ type: 'text', text: input }],
      role: 'user',
    };
    await trpc.ai.saveMessage.mutate({
      threadId: props.id,
      message,
    });
    sendMessage({
      text: input,
    });
    setInput('');
  };

  const keyUpHandler = (e: React.KeyboardEvent<HTMLIonTextareaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      status === 'ready' &&
      !isLoadingInitialState
    ) {
      e.preventDefault(); // Prevents adding a newline
      submitMessageQuery();
    } else {
      setInput(e.currentTarget.value || '');
    }
  };

  const updateMessage = async (message: FeynoteUIMessage) => {
    await trpc.ai.updateMessage.mutate({
      threadId: props.id,
      message,
    });
    await trpc.ai.deleteMessageToId.mutate({
      id: message.id,
      threadId: props.id,
    });
    await getThreadInfo();
    regenerate();
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
    regenerate();
  };

  return (
    <IonPage>
      <PaneNav
        title={title || t('assistant.thread.emptyTitle')}
        renderDropdownMenu={(children) => (
          <AIThreadOptionsPopover
            id={props.id}
            title={title || t('assistant.thread.emptyTitle')}
            setTitle={setTitle}
            navigate={navigate}
          >
            {children}
          </AIThreadOptionsPopover>
        )}
      />
      <IonContent>
        <ChatContainer>
          {ProgressBar}
          {isLoadingInitialState ? (
            <EmptyMessageContainer></EmptyMessageContainer>
          ) : !messages.length ? (
            <EmptyMessageContainer>
              <OptionsList>
                {PROMPT_CARDS.map((card, idx) => {
                  return (
                    <IonCard
                      key={idx}
                      button
                      onClick={() => {
                        setInput(t(card.query));
                        textAreaRef.current?.setFocus();
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
            </EmptyMessageContainer>
          ) : (
            <AIMessagesContainer
              updateMessage={updateMessage}
              retryMessage={retryMessage}
              messages={messages}
              ongoingCommunication={isLoading}
            />
          )}
          <ChatTextContainer>
            <IonTextarea
              ref={textAreaRef}
              placeholder={t('assistant.thread.input.placeholder')}
              value={input}
              disabled={isLoading || isLoadingInitialState}
              onKeyUp={keyUpHandler}
            />
            <SendButtonContainer>
              <IonButton onClick={submitMessageQuery}>
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
