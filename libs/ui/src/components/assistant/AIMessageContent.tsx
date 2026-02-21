import { AIUserMessage } from './AIUserMessage';
import { AIAssistantMessage } from './AIAssistantMessage';
import styled from 'styled-components';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import type { ChatStatus } from 'ai';

const MessageContentContainer = styled.div`
  padding-left: 8px;
`;

interface Props {
  message: FeynoteUIMessage;
  aiStatus: ChatStatus;
  updateMessage: (message: FeynoteUIMessage) => void;
  retryMessage: (messageId: string) => void;
}

export const AIMessageContent = (props: Props) => {
  const isUserMessage = props.message.role === 'user';

  return (
    <MessageContentContainer>
      {isUserMessage ? (
        <AIUserMessage
          message={props.message}
          aiStatus={props.aiStatus}
          updateMessage={props.updateMessage}
        />
      ) : (
        <AIAssistantMessage
          message={props.message}
          aiStatus={props.aiStatus}
          retryMessage={props.retryMessage}
        />
      )}
    </MessageContentContainer>
  );
};
