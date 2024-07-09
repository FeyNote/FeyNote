import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { ChatCompletionAssistantMessageParam } from 'openai/resources/chat/completions';
import { mail } from 'ionicons/icons';
import { routes } from '../../routes';
import { useTranslation } from 'react-i18next';
import { ThreadSummary } from '@feynote/prisma/types';
import { useMemo } from 'react';
import styled from 'styled-components';

const PreviewText = styled.p`
  overflow: hidden;
  height: 10px;
`;

interface Props {
  thread: ThreadSummary;
}

export const AIThreadMenuItem = (props: Props) => {
  const { t } = useTranslation();
  const previewText = useMemo(() => {
    if (!props.thread.messages.length) return null;
    const lastMessage = props.thread.messages[props.thread.messages.length - 1];
    if (!lastMessage.json) return null;
    return (lastMessage.json as unknown as ChatCompletionAssistantMessageParam)
      .content;
  }, []);

  return (
    <IonItem
      button
      routerLink={routes.assistantChat.build({ id: props.thread.id })}
    >
      <IonIcon slot="start" icon={mail} />
      <IonLabel>
        {props.thread.title || t('assistant.thread.emptyTitle')}
        <PreviewText>
          {previewText || t('assistant.thread.empty.preview')}
        </PreviewText>
      </IonLabel>
    </IonItem>
  );
};
