import { starkdown } from 'starkdown';
import { AIFCEditor } from './AIFCEditor';
import type { Message } from 'ai';
import { useMemo } from 'react';
import { FunctionName } from '@feynote/shared-utils';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { arrowUndoOutline, copyOutline } from 'ionicons/icons';

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
    return starkdown(message.content || '');
  }, [message.content]);

  const toolInvocationsToDisplay = useMemo(() => {
    if (!message.toolInvocations) return null;
    return message.toolInvocations.filter((invocation) =>
      Object.values<string>(FunctionName).includes(invocation.toolName),
    );
  }, [message]);

  const copyHTMLToClipboard = (html: string) => {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': html,
      }),
    ]);
  };

  if (toolInvocationsToDisplay) {
    return (
      <>
        {toolInvocationsToDisplay.map((toolInvocation) => {
          return (
            <AIFCEditor
              key={toolInvocation.toolCallId}
              toolInvocation={toolInvocation}
              copy={copyHTMLToClipboard}
            />
          );
        })}
      </>
    );
  }

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: messageHTML,
        }}
      ></div>
      <IonButtons>
        <IonButton
          size="small"
          onClick={() => copyHTMLToClipboard(messageHTML)}
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
  );
};
