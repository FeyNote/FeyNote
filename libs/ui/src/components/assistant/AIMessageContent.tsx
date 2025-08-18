import { AIUserMessage } from './AIUserMessage';
import { AIAssistantMessage } from './AIAssistantMessage';
import styled from 'styled-components';
import type { FeynoteUIMessage } from '@feynote/shared-utils';

const MessageContentContainer = styled.div`
  padding-left: 8px;
`;

interface Props {
  message: FeynoteUIMessage;
  ongoingCommunication: boolean;
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
          disableUpdate={props.ongoingCommunication}
          updateMessage={props.updateMessage}
        />
      ) : (
        <AIAssistantMessage
          message={props.message}
          disableRetry={props.ongoingCommunication}
          retryMessage={props.retryMessage}
        />
      )}
    </MessageContentContainer>
  );
};
