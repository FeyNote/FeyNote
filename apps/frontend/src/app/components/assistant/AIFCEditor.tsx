import { EditorContent } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useEffect } from 'react';
import { tiptapToolCallBuilder } from '@feynote/shared-utils';
import type { ToolInvocation } from 'ai';

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

  return (
    <ArtifactEditorContainer>
      <ArtifactEditorStyles data-theme="classic">
        <EditorContent editor={editor}></EditorContent>
      </ArtifactEditorStyles>
    </ArtifactEditorContainer>
  );
};
