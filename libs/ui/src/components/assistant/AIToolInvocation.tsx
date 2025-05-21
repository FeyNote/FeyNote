import { ToolInvocation } from 'ai';
import { IonSpinner } from '@ionic/react';
import { getEditorContentsFromToolInvocation } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';

interface Props {
  toolInvocation: ToolInvocation;
}

export const AIToolInvocation = (props: Props) => {
  const toolInvocationContents = getEditorContentsFromToolInvocation(
    props.toolInvocation,
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
