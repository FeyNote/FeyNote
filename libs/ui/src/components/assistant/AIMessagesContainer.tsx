import { IonIcon, IonLabel } from '@ionic/react';
import styled from 'styled-components';
import { personCircle } from 'ionicons/icons';
import { AIMessageRenderer } from './AIMessageRenderer';
import type { Message } from 'ai';
import { t } from 'i18next';

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
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  line-height: 1.5rem;
`;

const UserIcon = styled(IonIcon)`
  font-size: 30px;
  min-width: 30px;
  padding-right: 0.75rem;
  vertical-align: middle;
`;

const AILogo = styled.img`
  height: 30px;
  padding-right: 0.75rem;
  vertical-align: middle;
`;

const MessageHeader = styled(IonLabel)`
  font-weight: 500;
  vertical-align: middle;
`;

interface Props {
  messages: Message[];
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
}

export const AIMessagesContainer = (props: Props) => {
  return (
    <Scroller>
      <ScrollerContent>
        {props.messages
          .filter((message) => !!message)
          .map((message) => {
            const isUser = message.role === 'user';
            const name = isUser
              ? t('assistant.thread.user.name')
              : t('assistant.thread.assistant.name');
            return (
              <MessageContainer key={message.id}>
                <div>
                  {isUser ? (
                    <UserIcon icon={personCircle} />
                  ) : (
                    <AILogo src="https://static.feynote.com/assets/feynote-icon-20240925.png" />
                  )}
                  <MessageHeader>{name}</MessageHeader>
                </div>
                <AIMessageRenderer
                  message={message}
                  retryMessage={props.retryMessage}
                  disableRetry={props.disableRetry}
                />
              </MessageContainer>
            );
          })}
      </ScrollerContent>
    </Scroller>
  );
};
