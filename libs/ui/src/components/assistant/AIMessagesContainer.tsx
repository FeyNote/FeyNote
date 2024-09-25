import { IonIcon, IonLabel } from '@ionic/react';
import styled from 'styled-components';
import { personCircle } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { AIMessageRenderer } from './AIMessageRenderer';
import type { Message } from 'ai';

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
  messages: Message[];
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
}

export const AIMessagesContainer = (props: Props) => {
  const { t } = useTranslation();
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
                {isUser ? (
                  <UserIcon icon={personCircle} />
                ) : (
                  <AILogo src="https://static.feynote.com/assets/feynote-icon-20240925.png" />
                )}
                <FlexColumn>
                  <MessageHeader>{name}</MessageHeader>
                  <AIMessageRenderer
                    message={message}
                    retryMessage={props.retryMessage}
                    disableRetry={props.disableRetry}
                  />
                </FlexColumn>
              </MessageContainer>
            );
          })}
      </ScrollerContent>
    </Scroller>
  );
};
