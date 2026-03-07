import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { trpc } from '../../utils/trpc';
import { chatbubbles } from 'ionicons/icons';
import { NullState } from '../info/NullState';
import { PaneNav } from '../pane/PaneNav';
import {
  PaneContentContainer,
  PaneContent,
} from '../pane/PaneContentContainer';
import { useIndeterminateProgressBar } from '../../utils/useProgressBar';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePaneContext } from '../../context/pane/PaneContext';
import { AIThreadContextMenu } from './AIThreadContextMenu';
import { IoChatbubbles } from '../AppIcons';
import styled from 'styled-components';
import type { ThreadDTO, ThreadDTOMessage } from '@feynote/shared-utils';
import { EventName } from '../../context/events/EventName';
import { eventManager } from '../../context/events/EventManager';
import { useCurrentWorkspaceThreadIds } from '../../utils/workspace/useCurrentWorkspaceThreadIds';

const ThreadItemRow = styled.div`
  display: grid;
  grid-template-columns: min-content auto min-content;
  align-items: center;
  gap: 8px;
  user-select: none;
  padding: 16px;
  transition: background-color 100ms;
  background-color: var(--card-background);
  border-radius: 4px;
  margin-top: 6px;
  cursor: pointer;

  &:hover {
    background-color: var(--ion-background-color-step-100);
  }
`;

const ThreadContent = styled.div`
  min-width: 0;
`;

const ThreadTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThreadPreview = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--gray-11);
  margin-top: 2px;
`;

const ThreadDate = styled.div`
  font-size: 0.75rem;
  color: var(--gray-11);
  white-space: nowrap;
`;

const ThreadIcon = styled(IoChatbubbles)`
  font-size: 20px;
  flex-shrink: 0;
`;

const getLastMessagePreview = (
  messages: ThreadDTOMessage[],
): string | undefined => {
  const lastMessage = messages.at(-1);
  if (!lastMessage) return undefined;
  const textPart = lastMessage.parts.find((part) => part.type === 'text');
  if (!textPart || textPart.type !== 'text')
    return getLastMessagePreview(messages.slice(0, messages.length - 1));
  return textPart.text;
};

const getLastMessageDate = (thread: ThreadDTO): string | undefined => {
  const lastMessage = thread.messages.at(-1);
  if (!lastMessage) return undefined;
  return lastMessage.updatedAt.toLocaleDateString();
};

export const AIThreadsList: React.FC = () => {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);
  const { pane } = usePaneContext();
  const currentWorkspaceThreadIds = useCurrentWorkspaceThreadIds();

  const filteredThreads = useMemo(() => {
    if (!currentWorkspaceThreadIds) return threads;
    return threads.filter((thread) => currentWorkspaceThreadIds.has(thread.id));
  }, [threads, currentWorkspaceThreadIds]);

  const getUserThreads = () => {
    const progress = startProgressBar();
    trpc.ai.getThreads
      .query()
      .then((_threads) => {
        setThreads(
          _threads.sort(
            (a, b) =>
              (b.messages.at(-1)?.updatedAt.getTime() || 0) -
              (a.messages.at(-1)?.updatedAt.getTime() || 0),
          ),
        );
      })
      .catch((error) => {
        handleTRPCErrors(error);
      })
      .finally(() => {
        setIsLoading(false);
        progress.dismiss();
      });
  };

  useEffect(() => {
    getUserThreads();
    const threadUpdateHandler = () => {
      getUserThreads();
    };
    eventManager.addEventListener(EventName.ThreadUpdated, threadUpdateHandler);
    return () => {
      eventManager.removeEventListener(
        EventName.ThreadUpdated,
        threadUpdateHandler,
      );
    };
  }, []);

  const render = () => {
    if (isLoading) return;

    if (!filteredThreads.length)
      return (
        <NullState
          title={t('assistant.threads.nullState.title')}
          message={t('assistant.threads.nullState.message')}
          icon={chatbubbles}
        />
      );

    return filteredThreads
      .map((thread) => ({
        thread,
        lastMessagePreview: getLastMessagePreview(thread.messages),
      }))
      .map(({ thread, lastMessagePreview }) => (
        <AIThreadContextMenu
          key={thread.id}
          id={thread.id}
          title={thread.title || t('generic.untitled')}
          paneId={pane.id}
          onDelete={getUserThreads}
          onTitleChange={() => getUserThreads()}
        >
          <ThreadItemRow
            onClick={(event) =>
              navigateWithKeyboardHandler(event, PaneableComponent.AIThread, {
                id: thread.id,
              })
            }
          >
            <ThreadIcon />
            <ThreadContent>
              <ThreadTitle>{thread.title || t('generic.untitled')}</ThreadTitle>
              {lastMessagePreview && (
                <ThreadPreview>{lastMessagePreview}</ThreadPreview>
              )}
            </ThreadContent>
            {getLastMessageDate(thread) && (
              <ThreadDate>{getLastMessageDate(thread)}</ThreadDate>
            )}
          </ThreadItemRow>
        </AIThreadContextMenu>
      ));
  };

  return (
    <PaneContentContainer>
      <PaneNav title={t('assistant.title')} />
      <PaneContent>
        {ProgressBar}
        {render()}
      </PaneContent>
    </PaneContentContainer>
  );
};
