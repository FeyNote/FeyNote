import type { Message } from 'ai';
import { IonSpinner } from '@ionic/react';
import { isDisplayableInvocation } from '../../utils/assistant/isDisplayableInvocation';
import { AIToolInvocation } from './AIToolInvocation';
import { AIMessagePartText } from './AIMessagePartText';

interface Props {
  message: Message;
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
}

export const AIAssistantMessage = ({
  message,
  retryMessage,
  disableRetry,
}: Props) => {
  if (!message.parts || message.parts.length === 1) {
    return <IonSpinner name="dots" />;
  }

  return (
    message.parts &&
    message.parts.map((part, i) => {
      if (
        part.type === 'tool-invocation' &&
        isDisplayableInvocation(part.toolInvocation)
      ) {
        return (
          <AIToolInvocation key={i} toolInvocation={part.toolInvocation} />
        );
      } else if (part.type === 'text') {
        return (
          <AIMessagePartText
            key={i}
            part={part}
            retryMessage={retryMessage}
            disableRetry={disableRetry}
            messageId={message.id}
          />
        );
      }
    })
  );
};
