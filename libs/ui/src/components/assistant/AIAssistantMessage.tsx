import type { Message } from 'ai';
import { starkdown } from 'starkdown';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyOutline, refresh } from 'ionicons/icons';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { useMemo } from 'react';
import { isToolInvocationReadyToDipslay } from '../../utils/assistant/isToolInvocationReadyToDisplay';
import { AIToolInvocation } from './AIToolInvocation';

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
  const isThereInvocationToDisplay = message.toolInvocations?.find(
    isToolInvocationReadyToDipslay,
  );
  const messageHTML = useMemo(() => {
    if (!message.content) return null;
    return starkdown(message.content);
  }, [message.content]);

  if (!isThereInvocationToDisplay && !messageHTML) {
    return <IonSpinner name="dots" />;
  }

  return (
    <>
      {message.toolInvocations && isThereInvocationToDisplay && (
        <>
          {message.toolInvocations.map((toolInvocation) => (
            <AIToolInvocation
              key={toolInvocation.toolCallId}
              toolInvocation={toolInvocation}
            />
          ))}
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
            <IonButton
              disabled={disableRetry}
              size="small"
              onClick={() => retryMessage(message.id)}
            >
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </>
      )}
    </>
  );
};
