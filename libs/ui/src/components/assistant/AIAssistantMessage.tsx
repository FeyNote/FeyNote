import { IonSpinner } from '@ionic/react';
import { isDisplayableToolPart } from '../../utils/assistant/isDisplayableInvocation';
import { AIToolPart } from './AIToolInvocation';
import { AIMessagePartText } from './AIMessagePartText';
import type { ToolUIPart } from 'ai';
import type { ToolName } from '@feynote/shared-utils';
import type { FeynoteUIMessage } from './FeynoteUIMessage';

interface Props {
  message: FeynoteUIMessage;
  deleteUntilMessageId: (params: { id: string; inclusive: boolean }) => Promise<void>;
  resendMessageList: () => Promise<void>;
  disableRetry: boolean;
}

export const AIAssistantMessage = ({
  message,
  deleteUntilMessageId,
  resendMessageList,
  disableRetry,
}: Props) => {
  if (!message.parts || message.parts.length === 0) {
    return <IonSpinner name="dots" />;
  }

  const retryMessage = () => {
    deleteUntilMessageId({ id: message.id, inclusive: true })
    resendMessageList()
  }

  return (
    message.parts &&
    message.parts.map((part, i) => {
      if (
        part.type.includes('tool-') &&
        isDisplayableToolPart(part)
      ) {
        return (
          <AIToolPart key={i} part={part} />
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
      return null;
    })
  );
};
