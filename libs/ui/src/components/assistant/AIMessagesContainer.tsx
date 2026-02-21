import styled from 'styled-components';
import { AIMessageContent } from './AIMessageContent';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import type { ChatStatus } from 'ai';

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
  border-bottom: 2px solid var(--ion-border-color);
`;

const UserMessageContainer = styled.div`
  margin-left: auto;
  max-width: 80%;
  background: var(--ion-background-color-step-100);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  margin-right: 1.5rem;
  line-height: 1.5rem;
`;

const AssistantMessageContainer = styled.div`
  width: 100%;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  line-height: 1.5rem;
`;

interface Props {
  messages: FeynoteUIMessage[];
  aiStatus: ChatStatus;
  updateMessage: (message: FeynoteUIMessage) => void;
  retryMessage: (messageId: string) => void;
}

export const AIMessagesContainer = (props: Props) => {
  return (
    <Scroller>
      <ScrollerContent>
        {props.messages
          .filter((message) => !!message)
          .map((message) => {
            const isUser = message.role === 'user';
            const Container = isUser
              ? UserMessageContainer
              : AssistantMessageContainer;
            return (
              <Container key={message.id}>
                <AIMessageContent
                  message={message}
                  aiStatus={props.aiStatus}
                  retryMessage={props.retryMessage}
                  updateMessage={props.updateMessage}
                />
              </Container>
            );
          })}
      </ScrollerContent>
    </Scroller>
  );
};
