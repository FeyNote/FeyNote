import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import { useEditor } from '@tiptap/react';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';

interface Props {
  content: JSONContent;
}

export const AIFCEditor: React.FC<Props> = ({ content }) => {
  const editor = useEditor({
    content,
  });

  return (
    <ArtifactEditorStyles data-theme="classic">
      <EditorContent editor={editor} />
    </ArtifactEditorStyles>
  );
};
