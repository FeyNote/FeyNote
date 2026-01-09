import { IonSpinner } from '@ionic/react';
import { AIToolPart } from './AIToolInvocation';
import { AIMessagePartText } from './AIMessagePartText';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';

interface Props {
  message: FeynoteUIMessage;
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
}

export const AIAssistantMessage = (props: Props) => {
  const { t } = useTranslation();
  if (!props.message.parts || props.message.parts.length === 0) {
    return <IonSpinner name="dots" />;
  }

  return (
    props.message.parts &&
    props.message.parts.map((part, i) => {
      if (
        part.type === 'tool-generate5eMonster' ||
        part.type === 'tool-generate5eObject' ||
        part.type === 'tool-scrapeUrl'
      ) {
        if (part.state === 'output-error' || part.state === 'output-denied') {
          return t('aiAssistantMessage.error');
        }
        return (
          <AIToolPart
            key={i}
            messageId={props.message.id}
            disableRetry={props.disableRetry}
            retryMessage={props.retryMessage}
            part={part}
          />
        );
      } else if (part.type === 'text') {
        return (
          <AIMessagePartText
            key={i}
            part={part}
            retryMessage={props.retryMessage}
            disableRetry={props.disableRetry}
            messageId={props.message.id}
          />
        );
      }
      return null;
    })
  );
};
