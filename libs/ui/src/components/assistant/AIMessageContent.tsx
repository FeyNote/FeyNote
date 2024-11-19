import type { Message } from 'ai';
import { AIUserMessage } from './AIUserMessage';
import { AIAssistantMessage } from './AIAssistantMessage';
import styled from 'styled-components';

const MessageContentContainer = styled.div`
  padding-left: 8px;
`;

interface Props {
  message: Message;
  retryMessage: (messageId: string) => void;
  updateMessage: (message: Message) => void;
  ongoingCommunication: boolean;
}

export const AIMessageContent = ({
  ongoingCommunication,
  message,
  retryMessage,
  updateMessage,
}: Props) => {
  const isUserMessage = message.role === 'user';

  return (
    <MessageContentContainer>
      {isUserMessage ? (
        <AIUserMessage
          message={message}
          updateMessage={updateMessage}
          disableEdit={ongoingCommunication}
        />
      ) : (
        <AIAssistantMessage
          message={message}
          retryMessage={retryMessage}
          disableRetry={ongoingCommunication}
        />
      )}
    </MessageContentContainer>
  );
};
