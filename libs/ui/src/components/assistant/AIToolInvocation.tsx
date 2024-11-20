import { ToolInvocation } from 'ai';
import { IonSpinner } from '@ionic/react';
import { useMemo } from 'react';
import { getEditorContentsFromToolInvocation } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';

interface Props {
  toolInvocation: ToolInvocation;
}

export const AIToolInvocation = (props: Props) => {
  const toolInvocationContents = useMemo(
    () => getEditorContentsFromToolInvocation(props.toolInvocation),
    [props.toolInvocation],
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
