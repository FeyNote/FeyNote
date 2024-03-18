import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import ListItem from '@tiptap/extension-list-item';
import { TiptapMenuBar } from './TiptapMenuBar';
import { IonCard } from '@ionic/react';
import styled from 'styled-components';

const StyledEditorContent = styled(EditorContent)`
  .tiptap {
    padding: 16px;
    outline: none;
  }
`;

interface Props {
  content?: string;
}

export const TiptapEditor = (props: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, ListItem],
    content: props.content,
  });

  if (!editor) return;

  return (
    <IonCard>
      <TiptapMenuBar editor={editor} />
      <StyledEditorContent editor={editor} />
    </IonCard>
  );
};
