import type { UIMessage } from '@ai-sdk/react';
import { AIUserMessage } from './AIUserMessage';
import { AIAssistantMessage } from './AIAssistantMessage';
import styled from 'styled-components';

const MessageContentContainer = styled.div`
  padding-left: 8px;
`;

interface Props {
  message: UIMessage;
  deleteUntilMessageId: (params: { id: string; inclusive: boolean }) => Promise<void>;
  resendMessageList: () => Promise<void>;
  setMessage: (params: { id: string, text: string }) => Promise<void>;
  ongoingCommunication: boolean;
}

export const AIMessageContent = ({
  ongoingCommunication,
  message,
  resendMessageList,
  setMessage,
  deleteUntilMessageId,
}: Props) => {
  const isUserMessage = message.role === 'user';

  return (
    <MessageContentContainer>
      {isUserMessage ? (
        <AIUserMessage
          message={message}
          resendMessageList={resendMessageList}
          deleteUntilMessageId={deleteUntilMessageId}
          setMessage={setMessage}
          disableEdit={ongoingCommunication}
        />
      ) : (
        <AIAssistantMessage
          message={message}
          resendMessageList={resendMessageList}
          deleteUntilMessageId={deleteUntilMessageId}
          disableRetry={ongoingCommunication}
        />
      )}
    </MessageContentContainer>
  );
};
