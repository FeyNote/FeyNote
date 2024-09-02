import { EditorContent } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useEffect } from 'react';
import { tiptapToolCallBuilder } from '@feynote/shared-utils';
import { copyOutline } from 'ionicons/icons';
import type { ToolInvocation } from 'ai';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import styled from 'styled-components';

const PaddedEditor = styled(EditorContent)`
  max-width: min-content;
`;

interface Props {
  toolInvocation: ToolInvocation;
}

export const AIFCEditor: React.FC<Props> = ({ toolInvocation }) => {
  const editor = useArtifactEditor({
    editable: false,
    knownReferences: new Map(),
    yjsProvider: undefined,
    yDoc: new YDoc(),
  });

  useEffect(() => {
    try {
      const content = tiptapToolCallBuilder(toolInvocation);
      editor?.commands.setContent(content);
    } catch (e) {
      console.log(e);
    }
  }, [editor, toolInvocation]);

  const copyEditorContent = () => {
    const editorHtml = editor?.getHTML();
    if (!editorHtml) return;
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': editorHtml,
      }),
    ]);
  };

  return (
    <>
      <ArtifactEditorContainer>
        <ArtifactEditorStyles data-theme="classic">
          <PaddedEditor editor={editor}></PaddedEditor>
        </ArtifactEditorStyles>
      </ArtifactEditorContainer>
      <IonButtons>
        <IonButton onClick={() => copyEditorContent()}>
          <IonIcon slot="icon-only" icon={copyOutline} />
        </IonButton>
      </IonButtons>
    </>
  );
};
