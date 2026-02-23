import { type UIDataTypes, type UIMessagePart, type ChatStatus } from 'ai';
import { Spinner } from '@radix-ui/themes';
import { getEditorContentsFromToolPart } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';
import type { FeynoteUITool } from '@feynote/shared-utils';
import { useMemo } from 'react';

interface Props {
  part: UIMessagePart<UIDataTypes, FeynoteUITool>;
  messageId: string;
  retryMessage: (messageId: string) => void;
  aiStatus: ChatStatus;
}

export const AIToolPart = (props: Props) => {
  const toolPartContents = useMemo(
    () => getEditorContentsFromToolPart(props.part),
    [props.part],
  );
  if (!toolPartContents.length) return <Spinner />;

  return (
    <>
      {toolPartContents.map((content, i) => (
        <AIEditor
          key={i}
          messageId={props.messageId}
          aiStatus={props.aiStatus}
          retryMessage={props.retryMessage}
          editorContent={content}
        />
      ))}
    </>
  );
};
