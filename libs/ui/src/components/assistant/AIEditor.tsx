import { EditorContent, JSONContent } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo } from 'react';
import { copyOutline } from 'ionicons/icons';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import styled from 'styled-components';

const AIFCEditorContainer = styled.div`
  margin: 8px 0;
`;

interface Props {
  editorContent: string | JSONContent;
}

export const AIEditor: React.FC<Props> = (props) => {
  const yDoc = useMemo(() => {
    return new YDoc();
  }, []);

  const editor = useArtifactEditor({
    editable: false,
    yDoc,
    getFileUrl: () => '', // We don't currently support embedded images within the AI Editor
  });

  useEffect(() => {
    editor?.commands.setContent(props.editorContent);
  }, [props.editorContent]);

  if (editor && props.editorContent) {
    return (
      <AIFCEditorContainer>
        <ArtifactEditorContainer>
          <ArtifactEditorStyles>
            <EditorContent editor={editor}></EditorContent>
          </ArtifactEditorStyles>
        </ArtifactEditorContainer>
        <IonButtons>
          <IonButton
            size="small"
            onClick={() => copyToClipboard({ html: editor.getHTML() })}
          >
            <IonIcon icon={copyOutline} />
          </IonButton>
        </IonButtons>
      </AIFCEditorContainer>
    );
  }

  return <IonSpinner name="dots"></IonSpinner>;
};
