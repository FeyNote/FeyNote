import type { ChatStatus } from 'ai';
import { JSONContent, type Editor } from '@tiptap/react';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo, useRef } from 'react';
import { RiFileCopyLine, RiRefreshLine } from '../AppIcons';
import { Flex, IconButton, Spinner } from '@radix-ui/themes';
import { copyToClipboard } from '../../utils/copyToClipboard';
import styled from 'styled-components';
import {
  TiptapEditor,
  type ArtifactEditorSetContent,
} from '../editor/TiptapEditor';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

const AIFCEditorContainer = styled.div`
  margin: 8px 0;

  ion-card {
    background: none;
    box-shadow: none;
  }
`;

interface Props {
  editorContent: string | JSONContent;
  messageId: string;
  retryMessage: (messageId: string) => void;
  aiStatus: ChatStatus;
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
        <Flex gap="1">
          <IconButton
            variant="ghost"
            size="1"
            onClick={() =>
              copyToClipboard({ html: editorRef.current?.getHTML() })
            }
          >
            <RiFileCopyLine />
          </IconButton>
          <IconButton
            variant="ghost"
            size="1"
            disabled={
              props.aiStatus === 'submitted' || props.aiStatus === 'streaming'
            }
            onClick={() => props.retryMessage(props.messageId)}
          >
            <RiRefreshLine />
          </IconButton>
        </Flex>
      </AIFCEditorContainer>
    );
  }

  return <Spinner />;
};
