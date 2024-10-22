import { starkdown } from 'starkdown';
import { AIFCEditor } from './AIFCEditor';
import type { Message, ToolInvocation } from 'ai';
import { useMemo } from 'react';
import {
  AllowedToolInvocation,
  tiptapToolInvocationBuilder,
  ToolName,
} from '@feynote/shared-utils';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyOutline, pencil } from 'ionicons/icons';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { TFunction } from 'i18next';
import { t } from 'i18next';
import { JSONContent } from '@tiptap/core';

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

  const getEditorContentsFromToolInvocation = (
    invocation: ToolInvocation,
    t: TFunction,
  ): (string | JSONContent)[] => {
    if (
      (invocation.toolName === ToolName.Generate5eObject ||
        invocation.toolName === ToolName.Generate5eMonster) &&
      invocation.args
    ) {
      const tiptapContent = tiptapToolInvocationBuilder(
        invocation as AllowedToolInvocation,
        t,
      );
      if (!tiptapContent) return [];
      return [tiptapContent];
    }
    if (
      invocation.toolName === ToolName.ScrapeUrl &&
      invocation.state === 'result'
    ) {
      const editorContents: (string | JSONContent)[] = [];
      if (invocation.result.text) {
        editorContents.push(starkdown(invocation.result.text));
      }
      if (invocation.result.toolInvocations) {
        invocation.result.toolInvocations.forEach(
          (invocation: ToolInvocation) =>
            editorContents.push(
              ...getEditorContentsFromToolInvocation(invocation, t),
            ),
        );
      }
      return editorContents;
    }
    return [];
  };

  const toolInvocationsToDisplay =
    message.toolInvocations &&
    message.toolInvocations.filter((invocation) => {
      return (
        Object.values<string>(ToolName).includes(invocation.toolName) &&
        invocation.args &&
        Object.keys(invocation.args).length
      );
    });

  if (!toolInvocationsToDisplay?.length && !messageHTML) {
    return <IonSpinner name="dots"></IonSpinner>;
  }

  return (
    <div>
      {toolInvocationsToDisplay && (
        <>
          {toolInvocationsToDisplay.map((toolInvocation) => {
            const toolInvocationContents = getEditorContentsFromToolInvocation(
              toolInvocation,
              t,
            );
            if (!toolInvocationContents) return;
            return (
              <div key={toolInvocation.toolCallId}>
                {toolInvocationContents.map((content, i) => (
                  <AIFCEditor key={i} editorContent={content} />
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
            {message.role === 'user' && (
              <IonButton
                disabled={disableRetry}
                size="small"
                onClick={() => retryMessage(message.id)}
              >
                <IonIcon icon={pencil} />
              </IonButton>
            )}
          </IonButtons>
        </>
      )}
    </div>
  );
};
