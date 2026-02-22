import { useEffect, useState } from 'react';
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
import type { ThreadDTO } from '@feynote/shared-utils';

const ThreadItemRow = styled.div`
  display: grid;
  grid-template-columns: min-content auto;
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

const ThreadTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ThreadIcon = styled(IoChatbubbles)`
  font-size: 20px;
  flex-shrink: 0;
`;

export const AIThreadsList: React.FC = () => {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startProgressBar, ProgressBar } = useIndeterminateProgressBar();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler(true);
  const { pane } = usePaneContext();

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
  }, []);

  const render = () => {
    if (isLoading) return;

    if (!threads.length)
      return (
        <NullState
          title={t('assistant.threads.nullState.title')}
          message={t('assistant.threads.nullState.message')}
          icon={chatbubbles}
        />
      );

    return threads.map((thread) => (
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
          <ThreadTitle>{thread.title || t('generic.untitled')}</ThreadTitle>
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
