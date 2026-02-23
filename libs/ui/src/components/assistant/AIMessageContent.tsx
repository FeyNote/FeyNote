import { AIUserMessage } from './AIUserMessage';
import { AIAssistantMessage } from './AIAssistantMessage';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import type { ChatStatus } from 'ai';

interface Props {
  message: FeynoteUIMessage;
  aiStatus: ChatStatus;
  updateMessage: (message: FeynoteUIMessage) => void;
  retryMessage: (messageId: string) => void;
}

export const AIMessageContent = (props: Props) => {
  const isUserMessage = props.message.role === 'user';

  if (isUserMessage) {
    return (
      <AIUserMessage
        message={props.message}
        aiStatus={props.aiStatus}
        updateMessage={props.updateMessage}
        retryMessage={props.retryMessage}
      />
    );
  }

  return (
    <AIAssistantMessage
      message={props.message}
      aiStatus={props.aiStatus}
      retryMessage={props.retryMessage}
    />
  );
};
