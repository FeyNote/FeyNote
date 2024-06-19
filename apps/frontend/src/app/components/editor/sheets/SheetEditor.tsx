import { useEditor, EditorContent } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Blockquote } from '@tiptap/extension-blockquote';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { BulletList } from '@tiptap/extension-bullet-list';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { History } from '@tiptap/extension-history';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TiptapCommands } from '../tiptap/TiptapCommands';
import { renderCommandList } from '../tiptap/renderCommandList';
import { FC, useMemo } from 'react';
import { getTiptapCommands } from '../tiptap/getTiptapCommands';

interface SheetEditorContainerProps {
  $focused: boolean;
  children: React.ReactNode;
}

interface Props {
  content?: string;
  onUpdate: (args: { content: string; contentHtml: string }) => void;
  container: React.FC<SheetEditorContainerProps>;
}

export const SheetEditor: FC<Props> = (props) => {
  // Only parse content on first load (since tiptap tracks state internally)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialContent = useMemo(() => JSON.parse(props.content || '""'), []);

  const editor = useEditor({
    extensions: [
      Document,
      Heading,
      Paragraph,
      Text,
      HorizontalRule,
      Blockquote,
      ListItem,
      OrderedList,
      BulletList,
      HardBreak,
      Bold,
      Italic,
      Dropcursor,
      Gapcursor,
      History,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TiptapCommands.configure({
        suggestion: {
          items: getTiptapCommands,
          render: renderCommandList,
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      props.onUpdate({
        content: JSON.stringify(editor.getJSON()),
        contentHtml: editor.getHTML(),
      });
    },
  });

  return (
    <props.container $focused={!!editor?.isFocused}>
      <div onClick={(e) => e.stopPropagation()}>
        <EditorContent
          editor={editor}
          style={{ minWidth: '200px' }}
        ></EditorContent>
      </div>
    </props.container>
  );
};
