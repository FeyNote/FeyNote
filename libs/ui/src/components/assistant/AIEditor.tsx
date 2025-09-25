import { JSONContent, type Editor } from '@tiptap/react';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo, useRef } from 'react';
import { copyOutline, refresh } from 'ionicons/icons';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import styled from 'styled-components';
import {
  TiptapEditor,
  type ArtifactEditorSetContent,
} from '../editor/TiptapEditor';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

const AIFCEditorContainer = styled.div`
  margin: 8px 0;
`;

interface Props {
  editorContent: string | JSONContent;
  messageId: string;
  retryMessage: (messageId: string) => void;
  disableRetry: boolean;
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
            artifactId={'00000000-0000-0000-0000-000000000000'}
            editable={false}
            authorizedScope={CollaborationConnectionAuthorizedScope.ReadOnly}
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
          <IonButton
            disabled={props.disableRetry}
            size="small"
            onClick={() => props.retryMessage(props.messageId)}
          >
            <IonIcon icon={refresh} />
          </IonButton>
        </IonButtons>
      </AIFCEditorContainer>
    );
  }

  return <IonSpinner name="dots"></IonSpinner>;
};
