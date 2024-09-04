import { EditorContent } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo } from 'react';
import { tiptapToolCallBuilder } from '@feynote/shared-utils';
import { copyOutline } from 'ionicons/icons';
import type { ToolInvocation } from 'ai';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { copyToClipboard } from '../../../utils/copyToClipboard';
import styled from 'styled-components';

const StyledEditorContent = styled(EditorContent)`
  max-width: min-content;
`;

interface Props {
  toolInvocation: ToolInvocation;
}

export const AIFCEditor: React.FC<Props> = (props) => {
  const yDoc = useMemo(() => {
    return new YDoc();
  }, []);

  const editor = useArtifactEditor({
    editable: false,
    yDoc,
  });

  useEffect(() => {
    try {
      const content = tiptapToolCallBuilder(props.toolInvocation);
      editor?.commands.setContent(content);
    } catch (e) {
      console.log(e);
    }
  }, [editor, props.toolInvocation]);

  return (
    <>
      <ArtifactEditorContainer>
        <ArtifactEditorStyles data-theme="classic">
          <StyledEditorContent editor={editor}></StyledEditorContent>
        </ArtifactEditorStyles>
      </ArtifactEditorContainer>
      {editor && (
        <IonButtons>
          <IonButton
            size="small"
            onClick={() => copyToClipboard({ html: editor.getHTML() })}
          >
            <IonIcon icon={copyOutline} />
          </IonButton>
        </IonButtons>
      )}
    </>
  );
};
