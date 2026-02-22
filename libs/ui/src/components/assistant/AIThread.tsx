import { IonContent, IonPage } from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';
import styled from 'styled-components';
import { AIMessagesContainer } from './AIMessagesContainer';
import { PaneNav } from '../pane/PaneNav';
import { AIThreadDropdownMenu } from './AIThreadContextMenu';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { useTranslation } from 'react-i18next';
import { getApiUrls } from '../../utils/getApiUrls';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { EventName } from '../../context/events/EventName';
import type { EventData } from '../../context/events/EventData';
import { eventManager } from '../../context/events/EventManager';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { DefaultChatTransport } from 'ai';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import { useAlertContext } from '../../context/alert/AlertContext';
import { Card, IconButton, Spinner, TextArea } from '@radix-ui/themes';
import {
  IoSearch,
  FaPencil,
  GiMonsterGrasp,
  GiBroadsword,
  RiSendPlaneFill,
} from '../AppIcons';
import type { IconType } from 'react-icons';

const EmptyMessageContainer = styled.div`
  height: 100%;
`;

const PromptCard = styled(Card)`
  cursor: pointer;
`;

const PromptCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  gap: 8px;
`;

const PromptCardContent = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: var(--gray-11);
  margin-top: 4px;
`;

const OptionsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  gap: 8px;
  padding: 4px;
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
  gap: 16px;

  .rt-TextAreaInput {
    overflow: hidden;
  }
`;

const PROMPT_CARDS: {
  header: string;
  query: string;
  displayText?: string;
  icon: IconType;
}[] = [
  {
    header: 'aiThread.card.scrape.header',
    query: 'aiThread.card.scrape.query',
    displayText: 'aiThread.card.scrape.displayText',
    icon: IoSearch,
  },
  {
    header: 'aiThread.card.format.header',
    query: 'aiThread.card.format.query',
    displayText: 'aiThread.card.format.displayText',
    icon: FaPencil,
  },
  {
    header: 'aiThread.card.monster.header',
    query: 'aiThread.card.monster.query',
    icon: GiMonsterGrasp,
  },
  {
    header: 'aiThread.card.item.header',
    query: 'aiThread.card.item.query',
    icon: GiBroadsword,
  },
];

interface Props {
  id: string;
}

export const AIThread: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate, pane } = usePaneContext();
  const [title, setTitle] = useState<string | null>(null);
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const sessionContext = useSessionContext(true);
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { showAlert } = useAlertContext();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  const resizeTextArea = useCallback(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useEffect(() => {
    resizeTextArea();
  }, [input, resizeTextArea]);

  const { messages, setMessages, status, sendMessage, regenerate } =
    useChat<FeynoteUIMessage>({
      transport: new DefaultChatTransport({
        api: `${getApiUrls().rest}/message/`,
        headers: {
          Authorization: sessionContext?.session.token
            ? `Bearer ${sessionContext.session.token}`
            : '',
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
        //TODO: https://github.com/FeyNote/FeyNote/issues/1201
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
            showAlert({
              title: t('aiThread.createMessage.error.rateLimit.header'),
              children: t('aiThread.createMessage.error.rateLimit.message'),
              actionButtons: 'okay',
            });
            return;
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
        handleTRPCErrors(new Error());
      },
    });

  const isLoading = status === 'submitted' || status === 'streaming';

  const getThreadInfo = async () => {
    const threadDTO = await trpc.ai.getThread.query({
      id: props.id,
    });
    setMessages(threadDTO.messages);
    setTitle(threadDTO.title || null);
  };

  useEffect(() => {
    setIsLoadingInitialState(true);
    setTitle(null);
    setMessages([]);
    const progress = startProgressBar();
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
  }, [props.id]);

  const submitMessageQuery = async () => {
    if (!input.trim()) return;
    const message: FeynoteUIMessage = {
      id: crypto.randomUUID(),
      parts: [{ type: 'text', text: input }],
      role: 'user',
    };
    try {
      await trpc.ai.saveMessage.mutate({
        threadId: props.id,
        message,
      });
      sendMessage({
        text: input,
      });
    } catch (e) {
      handleTRPCErrors(e);
      return;
    }
    setInput('');
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
  };

  const updateMessage = async (message: FeynoteUIMessage) => {
    try {
      await trpc.ai.updateMessage.mutate({
        threadId: props.id,
        message,
      });
      await trpc.ai.deleteMessageToId.mutate({
        id: message.id,
        threadId: props.id,
      });
    } catch (e) {
      handleTRPCErrors(e);
      return;
    }
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
    try {
      await trpc.ai.deleteMessageToId.mutate({
        id: messageToDelete.id,
        threadId: props.id,
        inclusive: true,
      });
    } catch (e) {
      handleTRPCErrors(e);
      return;
    }
    const remainingMessages = messages.slice(0, retriedUserMsgIdx + 1);
    setMessages(remainingMessages);
    regenerate();
  };

  return (
    <IonPage>
      <PaneNav
        title={title || t('assistant.thread.emptyTitle')}
        renderDropdownMenu={(children) => (
          <AIThreadDropdownMenu
            id={props.id}
            title={title || t('assistant.thread.emptyTitle')}
            paneId={pane.id}
            onTitleChange={setTitle}
            onDelete={() =>
              navigate(
                PaneableComponent.AIThreadsList,
                {},
                PaneTransition.Replace,
              )
            }
          >
            {children}
          </AIThreadDropdownMenu>
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
                {PROMPT_CARDS.map((card, idx) => (
                  <PromptCard
                    key={idx}
                    onClick={() => {
                      setInput(t(card.query));
                      textAreaRef.current?.focus();
                    }}
                  >
                    <PromptCardHeader>
                      <card.icon />
                      {t(card.header)}
                    </PromptCardHeader>
                    <PromptCardContent>
                      {t(card.displayText || card.query)}
                    </PromptCardContent>
                  </PromptCard>
                ))}
              </OptionsList>
            </EmptyMessageContainer>
          ) : (
            <AIMessagesContainer
              updateMessage={updateMessage}
              retryMessage={retryMessage}
              messages={messages}
              aiStatus={status}
            />
          )}
          <ChatTextContainer>
            <TextArea
              style={{ flex: 1 }}
              ref={textAreaRef}
              placeholder={t('assistant.thread.input.placeholder')}
              value={input}
              disabled={isLoading || isLoadingInitialState}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  if (status === 'ready' && !isLoadingInitialState) {
                    submitMessageQuery();
                  }
                }
              }}
            />
            <IconButton
              disabled={isLoading || isLoadingInitialState}
              onClick={submitMessageQuery}
            >
              {isLoading || isLoadingInitialState ? (
                <Spinner />
              ) : (
                <RiSendPlaneFill />
              )}
            </IconButton>
          </ChatTextContainer>
        </ChatContainer>
      </IonContent>
    </IonPage>
  );
};
