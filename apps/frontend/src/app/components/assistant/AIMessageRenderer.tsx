import { starkdown } from 'starkdown';
import { AIFCEditor } from './AIFCEditor';
import type { Message } from 'ai';
import { useMemo } from 'react';
import { FunctionName } from '@feynote/shared-utils';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { arrowUndoOutline } from 'ionicons/icons';
import styled from 'styled-components';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

interface Props {
  message: Message;
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
}

export const AIMessageRenderer = ({
  disableRetry,
  message,
  retryMessage,
}: Props) => {
  const toolInvocationsToDisplay = useMemo(() => {
    if (!message.toolInvocations) return null;
    return message.toolInvocations.filter((invocation) =>
      Object.values<string>(FunctionName).includes(invocation.toolName),
    );
  }, [message]);
  if (toolInvocationsToDisplay) {
    return (
      <>
        {toolInvocationsToDisplay.map((toolInvocation) => {
          return (
            <AIFCEditor
              key={toolInvocation.toolCallId}
              toolInvocation={toolInvocation}
            />
          );
        })}
      </>
    );
  }
  return (
    <MessageContainer>
      <div
        dangerouslySetInnerHTML={{
          __html: starkdown(message.content || ''),
        }}
      ></div>
      {message.role === 'user' && (
        <IonButtons>
          <IonButton
            disabled={disableRetry}
            onClick={() => retryMessage(message.id)}
          >
            <IonIcon icon={arrowUndoOutline} />
          </IonButton>
        </IonButtons>
      )}
    </MessageContainer>
  );
};
