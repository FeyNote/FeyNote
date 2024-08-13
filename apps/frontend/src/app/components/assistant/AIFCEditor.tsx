import ParagraphExtension from '@tiptap/extension-paragraph';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import BulletListExtension from '@tiptap/extension-bullet-list';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import HardBreakExtension from '@tiptap/extension-hard-break';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import TableRowExtension from '@tiptap/extension-table-row';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableCellExtension from '@tiptap/extension-table-cell';
import DocumentExtension from '@tiptap/extension-document';
import TextExtension from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import LinkExtension from '@tiptap/extension-link';

import { EditorContent, useEditor } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import { ArtifactEditorStyles } from '../editor/ArtifactEditorStyles';
import { ArtifactEditorContainer } from '../editor/ArtifactEditorContainer';
import { HeadingExtension } from '../editor/tiptap/extensions/heading/HeadingExtension';
import { TableExtension } from '../editor/tiptap/extensions/table/TableExtension';
import { IndentationExtension } from '../editor/tiptap/extensions/indentation/IndentationExtension';
import { useArtifactEditor } from '../editor/useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { useCallback, useEffect } from 'react';

interface Props {
  content: JSONContent;
}

export const AIFCEditor: React.FC<Props> = ({ content }) => {
  const editor = useArtifactEditor({
    editable: false,
    knownReferences: new Map(),
    yjsProvider: undefined,
    yDoc: new YDoc(),
  });

  useEffect(() => {
    editor?.commands.setContent(content);
  }, [editor]);

  return (
    <ArtifactEditorContainer>
      <ArtifactEditorStyles data-theme="classic">
        <EditorContent editor={editor}></EditorContent>
      </ArtifactEditorStyles>
    </ArtifactEditorContainer>
  );
};
