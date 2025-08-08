import { type ToolUIPart } from 'ai';
import { IonSpinner } from '@ionic/react';
import { getEditorContentsFromToolInvocation } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';

interface Props {
  part: ToolUIPart;
}

export const AIToolPart = (props: Props) => {
  const toolInvocationContents = getEditorContentsFromToolInvocation(
    props.part,
  );
  if (!toolInvocationContents.length) return <IonSpinner name="dots" />;

  return (
    <>
      {toolInvocationContents.map((content, i) => (
        <AIEditor key={i} editorContent={content} />
      ))}
    </>
  );
};
