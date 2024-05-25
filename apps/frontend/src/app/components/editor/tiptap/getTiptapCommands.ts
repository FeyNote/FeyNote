import { Range } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import { LuHeading1, LuHeading2, LuTable } from 'react-icons/lu';
import { MdHorizontalRule } from 'react-icons/md';

interface CommandArgs {
  range: Range;
  editor: Editor;
}

export const getTiptapCommands = ({ query }: { query: string }) => {
  return [
    {
      title: 'Title',
      subtitle: 'Used as the top-most title',
      icon: LuHeading1,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run();
      },
    },
    {
      title: 'Section Header',
      subtitle: 'Used for subsections',
      icon: LuHeading2,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run();
      },
    },
    {
      title: 'Horizontal Rule',
      subtitle: 'Used to divide sections',
      icon: MdHorizontalRule,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Insert Table',
      subtitle: 'Used for stats, and for other notes',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    {
      title: 'Delete Table',
      subtitle: 'Removes the current focused table, if any',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).deleteTable().run();
      },
    },
    {
      title: 'Add Table Row Before',
      subtitle: 'Add a row to an existing table before the current row',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addRowBefore().run();
      },
    },
    {
      title: 'Add Table Row After',
      subtitle: 'Add a row to an existing table after the current row',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addRowAfter().run();
      },
    },
    {
      title: 'Delete Table Row',
      subtitle: 'Removes the current table row',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).deleteRow().run();
      },
    },
    {
      title: 'Add Table Column Before',
      subtitle: 'Add a column to an existing table before the current column',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addColumnBefore().run();
      },
    },
    {
      title: 'Add Table Column After',
      subtitle: 'Add a column to an existing table after the current column',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addColumnAfter().run();
      },
    },
    {
      title: 'Delete Table Column',
      subtitle: 'Removes the current table row',
      icon: LuTable,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).deleteColumn().run();
      },
    },
  ]
    .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10);
};
