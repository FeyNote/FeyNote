import { EditorContent } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo } from 'react';
import { copyOutline } from 'ionicons/icons';
import type { ToolInvocation } from 'ai';
import { IonButton, IonButtons, IonIcon } from '@ionic/react';
import { copyToClipboard } from '../../../utils/copyToClipboard';
import styled from 'styled-components';
import { tiptapToolCallBuilder } from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';

const StyledEditorContent = styled(EditorContent)`
  max-width: min-content;
  min-width: 400px;
`;

interface Props {
  toolInvocation: ToolInvocation;
}

export const AIFCEditor: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const yDoc = useMemo(() => {
    return new YDoc();
  }, []);

  const editor = useArtifactEditor({
    editable: false,
    yDoc,
  });

  useEffect(() => {
    try {
      const tiptapContent = tiptapToolCallBuilder(props.toolInvocation, t);
      if (!tiptapContent) return;
      editor?.commands.setContent(tiptapContent);
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
