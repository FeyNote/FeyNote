import { IonButton, IonButtons, IonIcon, IonLabel } from '@ionic/react';
import styled from 'styled-components';
import { personCircle, arrowUndoOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { AIMessageRenderer } from './AIMessageRenderer';
import type { ThreadDTOMessage } from '@feynote/prisma/types';

const ScrollerContent = styled.div`
  margin-bottom: auto;
`;

const Scroller = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
  overflow-anchor: auto !important;
  border-bottom: 2px solid #222222;
`;

const MessageContainer = styled.div`
  width: 100%;
  display: flex;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  max-width: 40rem;
  line-height: 1.5rem;
`;

const UserIcon = styled(IonIcon)`
  display: flex;
  align-items: flex-end;
  font-size: 30px;
  min-width: 30px;
  padding-right: 0.75rem;
`;

const AILogo = styled.img`
  height: 30px;
  padding-right: 0.75rem;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const MessageHeader = styled(IonLabel)`
  font-weight: 500;
`;

interface Props {
  messages: (ThreadDTOMessage | null)[];
  retryMessage: (messageId: string) => void;
}

export const AIMessagesContainer = (props: Props) => {
  const { t } = useTranslation();
  // TODO: Markdown to HTML Conversion https://github.com/RedChickenCo/FeyNote/issues/82
  return (
    <Scroller>
      <ScrollerContent>
        {props.messages
          .filter((message) => !!message)
          .map((message, idx) => {
            const isUser = message.json.role === 'user';
            const name = isUser
              ? t('assistant.thread.user.name')
              : t('assistant.thread.assistant.name');
            return (
              <MessageContainer key={message.id + idx}>
                {isUser ? (
                  <UserIcon icon={personCircle} />
                ) : (
                  <AILogo src="/assets/feynote_icon.png" />
                )}
                <FlexColumn>
                  <MessageHeader>{name}</MessageHeader>
                  <AIMessageRenderer messageParam={message.json} />
                  {!isUser && (
                    <IonButtons>
                      <IonButton onClick={() => props.retryMessage(message.id)}>
                        <IonIcon icon={arrowUndoOutline} />
                      </IonButton>
                    </IonButtons>
                  )}
                </FlexColumn>
              </MessageContainer>
            );
          })}
      </ScrollerContent>
    </Scroller>
  );
};
