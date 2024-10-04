import { starkdown } from 'starkdown';
import { AIFCEditor } from './AIFCEditor';
import type { Message } from 'ai';
import { useMemo } from 'react';
import { FunctionName } from '@feynote/shared-utils';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { arrowUndoOutline, copyOutline } from 'ionicons/icons';
import { copyToClipboard } from '../../utils/copyToClipboard';

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
  const messageHTML = useMemo(() => {
    if (!message.content) return null;
    return starkdown(message.content);
  }, [message.content]);

  const toolInvocationsToDisplay = useMemo(() => {
    if (!message.toolInvocations) return null;
    return message.toolInvocations.filter((invocation) =>
      Object.values<string>(FunctionName).includes(invocation.toolName),
    );
  }, [message]);

  return (
    <div>
      {toolInvocationsToDisplay && (
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
      )}
      {messageHTML && (
        <>
          <div
            dangerouslySetInnerHTML={{
              __html: messageHTML,
            }}
          ></div>
          <IonButtons>
            <IonButton
              size="small"
              onClick={() =>
                copyToClipboard({
                  html: messageHTML,
                  plaintext: message.content,
                })
              }
            >
              <IonIcon icon={copyOutline} />
            </IonButton>
            {message.role === 'user' && (
              <IonButton
                disabled={disableRetry}
                size="small"
                onClick={() => retryMessage(message.id)}
              >
                <IonIcon icon={arrowUndoOutline} />
              </IonButton>
            )}
          </IonButtons>
        </>
      )}
    </div>
  );
};
