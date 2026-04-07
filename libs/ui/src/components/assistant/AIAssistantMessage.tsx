import { Spinner } from '@radix-ui/themes';
import { AIToolPart } from './AIToolInvocation';
import { AIMessagePartText } from './AIMessagePartText';
import type { FeynoteUIMessage } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { ChatStatus } from 'ai';

const ErrorText = styled.span`
  color: var(--danger-color);
`;

interface Props {
  message: FeynoteUIMessage;
  retryMessage: (messageId: string) => void;
  aiStatus: ChatStatus;
}

export const AIAssistantMessage = (props: Props) => {
  const { t } = useTranslation();

  if (!props.message.parts || props.message.parts.length === 0) {
    if (props.aiStatus === 'submitted' || props.aiStatus === 'streaming') {
      return <Spinner />;
    }
    return <ErrorText>{t('aiAssistantMessage.error')}</ErrorText>;
  }

  return (
    <>
      {props.message.parts.map((part, i) => {
        if (
          part.type === 'tool-generate5eMonster' ||
          part.type === 'tool-generate5eObject' ||
          part.type === 'tool-scrapeUrl'
        ) {
          if (part.state === 'output-error' || part.state === 'output-denied') {
            return (
              <ErrorText key={i}>{t('aiAssistantMessage.error')}</ErrorText>
            );
          }
          return (
            <AIToolPart
              key={i}
              messageId={props.message.id}
              aiStatus={props.aiStatus}
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
              aiStatus={props.aiStatus}
              messageId={props.message.id}
            />
          );
        }
        return null;
      })}
    </>
  );
};
