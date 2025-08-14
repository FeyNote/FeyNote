import { IonIcon, IonLabel } from '@ionic/react';
import styled from 'styled-components';
import { personCircle } from 'ionicons/icons';
import { AIMessageContent } from './AIMessageContent';
import type { UIMessage } from '@ai-sdk/react';
import { useTranslation } from 'react-i18next';
import type { FeynoteUIMessage } from './FeynoteUIMessage';

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
  messages: FeynoteUIMessage[];
  deleteUntilMessageId: (params: { id: string; inclusive: boolean }) => Promise<void>;
  resendMessageList: () => Promise<void>;
  setMessage: (params: { id: string, text: string }) => Promise<void>;
  ongoingCommunication: boolean;
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
                <div>
                  {isUser ? (
                    <UserIcon icon={personCircle} />
                  ) : (
                    <AILogo src="https://static.feynote.com/assets/feynote-icon-20240925.png" />
                  )}
                  <MessageHeader>{name}</MessageHeader>
                </div>
                <AIMessageContent
                  message={message}
                  resendMessageList={props.resendMessageList}
                  deleteUntilMessageId={props.deleteUntilMessageId}
                  setMessage={props.setMessage}
                  ongoingCommunication={props.ongoingCommunication}
                />
              </MessageContainer>
            );
          })}
      </ScrollerContent>
    </Scroller>
  );
};
