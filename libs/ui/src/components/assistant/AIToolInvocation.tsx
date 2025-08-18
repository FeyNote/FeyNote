import { type UIDataTypes, type UIMessagePart } from 'ai';
import { IonSpinner } from '@ionic/react';
import { getEditorContentsFromToolPart } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';
import type { FeynoteUITool } from '@feynote/shared-utils';

interface Props {
  part: UIMessagePart<UIDataTypes, FeynoteUITool>;
  messageId: string;
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
}

export const AIToolPart = (props: Props) => {
  const toolPartContents = getEditorContentsFromToolPart(props.part);
  if (!toolPartContents.length) return <IonSpinner name="dots" />;

  return (
    <>
      {toolPartContents.map((content, i) => (
        <AIEditor
          key={i}
          messageId={props.messageId}
          disableRetry={props.disableRetry}
          retryMessage={props.retryMessage}
          editorContent={content}
        />
      ))}
    </>
  );
};
