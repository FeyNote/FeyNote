import { Range } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
  LuList,
  LuListOrdered,
  LuTable,
} from 'react-icons/lu';
import { MdHorizontalRule } from 'react-icons/md';
import { CgNotes } from 'react-icons/cg';
import { RxMagicWand } from 'react-icons/rx';
import { GiMonsterGrasp } from 'react-icons/gi';
import { t } from 'i18next';

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
      title: t('editor.commandMenu.hr'),
      keywords: ['hr', '-'],
      subtitle: t('editor.commandMenu.hr.subtitle'),
      visible: !editor.isActive('table'),
      icon: MdHorizontalRule,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: t('editor.commandMenu.table'),
      keywords: [],
      subtitle: t('editor.commandMenu.table.subtitle'),
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
      title: t('editor.commandMenu.monster'),
      keywords: ['stats'],
      subtitle: t('editor.commandMenu.monster.subtitle'),
      visible: !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setMonsterStatblock().run();
      },
    },
    {
      title: t('editor.commandMenu.wideMonster'),
      keywords: ['stats'],
      subtitle: t('editor.commandMenu.wideMonster.subtitle'),
      visible: !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setMonsterStatblock(true)
          .run();
      },
    },
    {
      title: t('editor.commandMenu.spell'),
      keywords: [],
      subtitle: t('editor.commandMenu.spell.subtitle'),
      visible: !editor.isActive('table'),
      icon: RxMagicWand,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setSpellSheet().run();
      },
    },
    {
      title: t('editor.commandMenu.note'),
      keywords: [],
      subtitle: t('editor.commandMenu.note.subtitle'),
      visible: !editor.isActive('table'),
      icon: CgNotes,
      command: ({ editor, range }: CommandArgs) => {
        editor.chain().focus().deleteRange(range).setTTRPGNote().run();
      },
    },
    {
      title: t('editor.commandMenu.h1'),
      keywords: ['h1', 'header'],
      subtitle: t('editor.commandMenu.h1.subtitle'),
      visible: true,
      icon: LuHeading1,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 1 })
          .run();
      },
    },
    {
      title: t('editor.commandMenu.h2'),
      keywords: ['h2', 'header'],
      subtitle: t('editor.commandMenu.h2.subtitle'),
      visible: true,
      icon: LuHeading2,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 2 })
          .run();
      },
    },
    {
      title: t('editor.commandMenu.h3'),
      keywords: ['h3', 'header'],
      subtitle: t('editor.commandMenu.h3.subtitle'),
      visible: true,
      icon: LuHeading3,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 3 })
          .run();
      },
    },
    {
      title: t('editor.commandMenu.h4'),
      keywords: ['h4', 'header'],
      subtitle: t('editor.commandMenu.h4.subtitle'),
      visible: true,
      icon: LuHeading4,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 4 })
          .run();
      },
    },
    {
      title: t('editor.commandMenu.h5'),
      keywords: ['h5', 'header'],
      subtitle: t('editor.commandMenu.h5.subtitle'),
      visible: true,
      icon: LuHeading5,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 5 })
          .run();
      },
    },
    {
      title: t('editor.commandMenu.h6'),
      keywords: ['h6', 'header'],
      subtitle: t('editor.commandMenu.h6.subtitle'),
      visible: true,
      icon: LuHeading6,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 6 })
          .run();
      },
    },
    {
      title: t('editor.commandMenu.bulletList'),
      keywords: ['list', 'bullet', 'unordered', 'ul', '-', '*'],
      subtitle: t('editor.commandMenu.bulletList.subtitle'),
      visible: true,
      icon: LuList,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setParagraph()
          .toggleBulletList()
          .run();
      },
    },
    {
      title: t('editor.commandMenu.orderedList'),
      keywords: ['list', 'numbered', 'ordered', 'ol', '-', '*', '1'],
      subtitle: t('editor.commandMenu.orderedList.subtitle'),
      visible: true,
      icon: LuListOrdered,
      command: ({ editor, range }: CommandArgs) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setParagraph()
          .toggleOrderedList()
          .run();
      },
    },
    {
      title: t('editor.commandMenu.paragraph'),
      keywords: ['paragraph', 'p'],
      subtitle: t('editor.commandMenu.paragraph.subtitle'),
      visible: true,
      icon: LuListOrdered,
      command: ({ editor, range }: CommandArgs) => {
        const chain = editor.chain().focus().deleteRange(range);
        if (editor.isActive('bulletList')) {
          chain.lift('bulletList');
        }
        if (editor.isActive('orderedList')) {
          chain.lift('orderedList');
        }
        if (editor.isActive('taskList')) {
          chain.lift('taskList');
        }
        chain.run();
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
