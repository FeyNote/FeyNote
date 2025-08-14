import { type UIDataTypes, type UIMessagePart } from 'ai';
import { IonSpinner } from '@ionic/react';
import { getEditorContentsFromToolPart } from '../../utils/assistant/getEditorContentsFromToolInvocation';
import { AIEditor } from './AIEditor';
import type { FeynoteUITool } from './FeynoteUIMessage';

interface Props {
  part: UIMessagePart<UIDataTypes, FeynoteUITool>;
}

export const AIToolPart = (props: Props) => {
  const toolPartContents = getEditorContentsFromToolPart(
    props.part,
    props.toolName
  );
  if (!toolPartContents.length) return <IonSpinner name="dots" />;

  return (
    <>
      {toolPartContents.map((content, i) => (
        <AIEditor key={i} editorContent={content} />
      ))}
    </>
  );
};
