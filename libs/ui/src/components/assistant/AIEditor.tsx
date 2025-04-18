import { JSONContent, type Editor } from '@tiptap/react';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo, useRef } from 'react';
import { copyOutline } from 'ionicons/icons';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import styled from 'styled-components';
import {
  TiptapEditor,
  type ArtifactEditorSetContent,
} from '../editor/TiptapEditor';

const AIFCEditorContainer = styled.div`
  margin: 8px 0;
`;

interface Props {
  editorContent: string | JSONContent;
}

export const AIEditor: React.FC<Props> = (props) => {
  const editorRef = useRef<Editor | null>(null);
  const setContentRef = useRef<ArtifactEditorSetContent | undefined>(undefined);

  const yDoc = useMemo(() => {
    return new YDoc();
  }, []);

  const updateContent = () => {
    setContentRef.current?.(props.editorContent);
  };

  useEffect(() => {
    updateContent();
  }, [props.editorContent]);

  if (props.editorContent) {
    return (
      <AIFCEditorContainer>
        <ArtifactEditorContainer>
          <TiptapEditor
            artifactId={undefined}
            editable={false}
            yDoc={yDoc}
            theme="default"
            getFileUrl={() => ''} // We don't currently support embedded images within the AI Editor
            setContentRef={setContentRef}
            onReady={() => {
              updateContent();
            }}
            editorRef={editorRef}
          />
        </ArtifactEditorContainer>
        <IonButtons>
          <IonButton
            size="small"
            onClick={() =>
              copyToClipboard({ html: editorRef.current?.getHTML() })
            }
          >
            <IonIcon icon={copyOutline} />
          </IonButton>
        </IonButtons>
      </AIFCEditorContainer>
    );
  }

  return <IonSpinner name="dots"></IonSpinner>;
};
