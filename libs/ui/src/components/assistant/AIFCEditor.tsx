import { EditorContent } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useEffect, useMemo } from 'react';
import { copyOutline } from 'ionicons/icons';
import type { ToolInvocation } from 'ai';
import { IonButton, IonButtons, IonIcon, IonSpinner } from '@ionic/react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import styled from 'styled-components';
import {
  AllowedToolInvocation,
  tiptapToolInvocationBuilder,
  ToolName,
} from '@feynote/shared-utils';
import { useTranslation } from 'react-i18next';
import { starkdown } from 'starkdown';
import { TFunction } from 'i18next';

const StyledEditorContent = styled(EditorContent)`
  max-width: min-content;
  min-width: 400px;
`;

interface Props {
  toolInvocation: ToolInvocation;
}

const getEditorContentFromInvocation = (
  invocation: ToolInvocation,
  t: TFunction,
) => {
  if (
    (invocation.toolName === ToolName.Generate5eObject ||
      invocation.toolName === ToolName.Generate5eMonster) &&
    invocation.args
  ) {
    return tiptapToolInvocationBuilder(invocation as AllowedToolInvocation, t);
  }
  if (
    invocation.toolName === ToolName.ScrapeUrl &&
    invocation.state === 'result'
  ) {
    return starkdown(invocation.result);
  }
};

export const AIFCEditor: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const yDoc = useMemo(() => {
    return new YDoc();
  }, []);

  const editorContent = useMemo(() => {
    const content = getEditorContentFromInvocation(props.toolInvocation, t);
    return content;
  }, [props.toolInvocation]);

  const editor = useArtifactEditor({
    editable: false,
    yDoc,
  });

  useEffect(() => {
    if (!editorContent) return;
    editor?.commands.setContent(editorContent);
  }, [editorContent]);

  if (editor && editorContent) {
    return (
      <>
        <ArtifactEditorContainer>
          <ArtifactEditorStyles data-theme="classic">
            <StyledEditorContent editor={editor}></StyledEditorContent>
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
      </>
    );
  }

  return <IonSpinner name="dots"></IonSpinner>;
};
