import { Range } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import {
  RiDeleteColumn,
  RiDeleteRow,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiInsertRowBottom,
  RiInsertRowTop,
  RiTable2,
} from 'react-icons/ri';
import { LuHeading1, LuHeading2, LuTable } from 'react-icons/lu';
import { MdHorizontalRule } from 'react-icons/md';
import { CgExtensionRemove, CgNotes } from 'react-icons/cg';
import { RxMagicWand } from 'react-icons/rx';
import { GiMonsterGrasp } from 'react-icons/gi';

interface CommandArgs {
  range: Range;
  editor: Editor;
}

export const getTiptapCommands = ({
  query,
  editor,
}: {
  query: string;
  editor: Editor;
}) => {
  const commands = [
    {
      title: 'Heading 1',
      keywords: ['h1'],
      subtitle: 'Used as a grand title',
      visible: true,
      icon: LuHeading1,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run();
      },
    },
    {
      title: 'Heading 2',
      keywords: ['h2'],
      subtitle: 'Used for smaller titles',
      visible: true,
      icon: LuHeading2,
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
      title: 'Heading 3',
      keywords: ['h3'],
      subtitle: 'Used for subsections',
      visible: true,
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
      title: 'Heading 4',
      keywords: ['h4'],
      subtitle: 'Used for subsections',
      visible: true,
      icon: LuHeading2,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 4 })
          .run();
      },
    },
    {
      title: 'Horizontal Rule',
      keywords: ['hr', '-'],
      subtitle: 'Used to divide sections',
      visible: !editor.isActive('table'),
      icon: MdHorizontalRule,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Insert Table',
      keywords: [],
      subtitle: 'Used for stats, and for other notes',
      visible: !editor.isActive('table'),
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
      keywords: [],
      subtitle: 'Removes the current focused table',
      visible: editor.isActive('table'),
      icon: CgExtensionRemove,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).deleteTable().run();
      },
    },
    {
      title: 'Add Table Row Before',
      keywords: ['tr'],
      subtitle: 'Add a row to an existing table before the current row',
      visible: editor.isActive('table'),
      icon: RiInsertRowTop,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addRowBefore().run();
      },
    },
    {
      title: 'Add Table Row After',
      keywords: ['tr'],
      subtitle: 'Add a row to an existing table after the current row',
      visible: editor.isActive('table'),
      icon: RiInsertRowBottom,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addRowAfter().run();
      },
    },
    {
      title: 'Delete Table Row',
      keywords: ['tr'],
      subtitle: 'Removes the current table row',
      visible: editor.isActive('table'),
      icon: RiDeleteRow,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).deleteRow().run();
      },
    },
    {
      title: 'Add Table Column Before',
      keywords: ['tc'],
      subtitle: 'Add a column to an existing table before the current column',
      visible: editor.isActive('table'),
      icon: RiInsertColumnLeft,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addColumnBefore().run();
      },
    },
    {
      title: 'Add Table Column After',
      keywords: ['tc'],
      subtitle: 'Add a column to an existing table after the current column',
      visible: editor.isActive('table'),
      icon: RiInsertColumnRight,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).addColumnAfter().run();
      },
    },
    {
      title: 'Delete Table Column',
      keywords: [],
      subtitle: 'Removes the current table row',
      visible: editor.isActive('table'),
      icon: RiDeleteColumn,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).deleteColumn().run();
      },
    },
    {
      title: 'Insert Monster Statblock',
      keywords: ['stats'],
      subtitle: 'Starts an editable monster statblock',
      visible: !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setMonsterStatblock().run();
      },
    },
    {
      title: 'Insert Spell',
      keywords: [],
      subtitle: 'Starts an editable spell object',
      visible: !editor.isActive('table'),
      icon: RxMagicWand,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setSpellSheet().run();
      },
    },
    {
      title: 'Insert Note',
      keywords: [],
      subtitle: 'Starts an editable note object',
      visible: !editor.isActive('table'),
      icon: CgNotes,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setTTRPGNote().run();
      },
    },
  ];

  return commands
    .filter((item) => item.visible)
    .filter((item) => {
      const keywords = (
        item.title +
        ' ' +
        item.keywords.join(' ')
      ).toLowerCase();

      const searchTokens = query.toLowerCase().split(' ');

      for (const searchToken of searchTokens) {
        if (!keywords.includes(searchToken)) return false;
      }
      return true;
    });
};
