import type { Message } from 'ai';
import { starkdown } from 'starkdown';
import { AIEditor } from './AIEditor';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyOutline, refresh } from 'ionicons/icons';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { useMemo } from 'react';
import { isToolInvocationReadyToDipslay } from '../../utils/assistant/isToolInvocationReadyToDisplay';
import { getEditorContentsFromToolInvocation } from '../../utils/assistant/getEditorContentsFromToolInvocation';

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
  const isThereInvocationToDisplay = useMemo((): boolean => {
    return !!message.toolInvocations?.find(isToolInvocationReadyToDipslay);
  }, [message.toolInvocations]);
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
          {message.toolInvocations.map((toolInvocation) => {
            const toolInvocationContents =
              getEditorContentsFromToolInvocation(toolInvocation);
            if (!toolInvocationContents.length)
              return <IonSpinner name="dots" />;
            return (
              <div key={toolInvocation.toolCallId}>
                {toolInvocationContents.map((content, i) => (
                  <AIEditor
                    key={`${toolInvocation.toolCallId}-${i}`}
                    editorContent={content}
                  />
                ))}
              </div>
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
