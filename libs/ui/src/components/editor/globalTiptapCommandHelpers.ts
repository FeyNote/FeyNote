import type { Editor, Range } from '@tiptap/core';
import type { IconType } from 'react-icons/lib';
import {
  GiMonsterGrasp,
  CgNotes,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
  LuIndentDecrease,
  LuIndentIncrease,
  LuList,
  LuListOrdered,
  LuRedo,
  LuTable,
  LuUndo,
  MdHorizontalRule,
  RxMagicWand,
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiBold,
  RiBox1Line,
  RiDeleteBackLine,
  RiFileCopyLine,
  RiItalic,
  RiLink,
  RiListCheck2,
  RiParagraph,
  RiScissorsCutLine,
  RiStrikethrough,
  RiUnderline,
} from '../AppIcons';
import {
  liftBlockOrListItem,
  sinkBlockOrListItem,
} from './tiptap/extensions/indentation/IndentationExtension';

export type GlobalTiptapCommandHelperEntry = {
  title: string;
  keywords: string[];
  subtitle?: string;
  enabled: (editor: Editor) => boolean;
  active?: (editor: Editor) => boolean;
  style?: { fontFamily: string };
  icon: IconType | undefined;
  command: (editor: Editor, range: Range) => void;
};

export const globalTiptapCommandHelpers = {
  insert: {
    hr: {
      title: 'editor.commandMenu.hr',
      keywords: ['hr', '-'],
      subtitle: 'editor.commandMenu.hr.subtitle',
      enabled: (editor: Editor) => !editor.isActive('table'),
      icon: MdHorizontalRule,
      command: (editor: Editor, range: Range) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    table: {
      title: 'editor.commandMenu.table',
      keywords: [],
      subtitle: 'editor.commandMenu.table.subtitle',
      enabled: (editor: Editor) => !editor.isActive('table'),
      icon: LuTable,
      command: (editor: Editor, range: Range) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    monster: {
      title: 'editor.commandMenu.monster',
      keywords: ['stats'],
      subtitle: 'editor.commandMenu.monster.subtitle',
      enabled: (editor: Editor) => !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: (editor: Editor, range: Range) => {
        editor.chain().focus().deleteRange(range).setMonsterStatblock().run();
      },
    },
    wideMonster: {
      title: 'editor.commandMenu.wideMonster',
      keywords: ['stats'],
      subtitle: 'editor.commandMenu.wideMonster.subtitle',
      enabled: (editor: Editor) => !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: (editor: Editor, range: Range) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setMonsterStatblock(true)
          .run();
      },
    },
    spell: {
      title: 'editor.commandMenu.spell',
      keywords: [],
      subtitle: 'editor.commandMenu.spell.subtitle',
      enabled: (editor: Editor) => !editor.isActive('table'),
      icon: RxMagicWand,
      command: (editor: Editor, range: Range) => {
        editor.chain().focus().deleteRange(range).setSpellSheet().run();
      },
    },
    note: {
      title: 'editor.commandMenu.note',
      keywords: [],
      subtitle: 'editor.commandMenu.note.subtitle',
      enabled: (editor: Editor) => !editor.isActive('table'),
      icon: CgNotes,
      command: (editor: Editor, range: Range) => {
        editor.chain().focus().deleteRange(range).setTTRPGNote().run();
      },
    },
    link: {
      title: 'editor.commandMenu.link',
      keywords: [],
      subtitle: 'editor.commandMenu.link.subtitle',
      enabled: () => true,
      active: (editor: Editor) => editor.isActive('link'),
      icon: RiLink,
      command: (editor: Editor) => {
        editor.chain().focus().setHyperlink().run();
      },
    },
  },
  format: {
    text: {
      toggleBold: {
        title: 'editor.commandMenu.bold',
        keywords: ['bold'],
        enabled: (editor: Editor) => editor.can().toggleBold(),
        icon: RiBold,
        command: (editor: Editor) => {
          editor.chain().focus().toggleBold().run();
        },
      },
      toggleItalic: {
        title: 'editor.commandMenu.italic',
        keywords: ['italic'],
        enabled: (editor: Editor) => editor.can().toggleItalic(),
        icon: RiItalic,
        command: (editor: Editor) => {
          editor.chain().focus().toggleItalic().run();
        },
      },
      toggleUnderline: {
        title: 'editor.commandMenu.underline',
        keywords: ['italic'],
        enabled: (editor: Editor) => editor.can().toggleUnderline(),
        icon: RiUnderline,
        command: (editor: Editor) => {
          editor.chain().focus().toggleUnderline().run();
        },
      },
      toggleStrike: {
        title: 'editor.commandMenu.strike',
        keywords: ['italic'],
        enabled: (editor: Editor) => editor.can().toggleStrike(),
        icon: RiStrikethrough,
        command: (editor: Editor) => {
          editor.chain().focus().toggleStrike().run();
        },
      },
    },
    font: {
      default: {
        title: 'editor.commandMenu.font.default',
        keywords: ['font'],
        subtitle: 'editor.commandMenu.font.default.subtitle',
        enabled: (editor: Editor) => editor.can().unsetFontFamily(),
        active: (editor: Editor) => editor.isActive({ fontFamily: '' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().unsetFontFamily().run();
        },
      },
      sans: {
        title: 'editor.commandMenu.font.sans',
        keywords: ['font'],
        style: { fontFamily: 'Roboto, Helvetica Neue, sans-serif' },
        subtitle: 'editor.commandMenu.font.sans.subtitle',
        enabled: (editor: Editor) =>
          editor.can().setFontFamily('Roboto, Helvetica Neue, sans-serif'),
        active: (editor: Editor) =>
          editor.isActive({ fontFamily: 'Roboto, Helvetica Neue, sans-serif' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .setFontFamily('Roboto, Helvetica Neue, sans-serif')
            .run();
        },
      },
      serif: {
        title: 'editor.commandMenu.font.serif',
        keywords: ['font'],
        style: { fontFamily: 'Times, serif' },
        subtitle: 'editor.commandMenu.font.serif.subtitle',
        enabled: (editor: Editor) => editor.can().setFontFamily('Times, serif'),
        active: (editor: Editor) =>
          editor.isActive({ fontFamily: 'Times, serif' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().setFontFamily('Times, serif').run();
        },
      },
      libreBaskerville: {
        title: 'editor.commandMenu.font.libreBaskerville',
        keywords: ['font'],
        style: { fontFamily: 'Libre Baskerville' },
        subtitle: 'editor.commandMenu.font.libreBaskerville.subtitle',
        enabled: (editor: Editor) =>
          editor.can().setFontFamily('Libre Baskerville'),
        active: (editor: Editor) =>
          editor.isActive({ fontFamily: 'Libre Baskerville' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().setFontFamily('Libre Baskerville').run();
        },
      },
      mrEavesRemake: {
        title: 'editor.commandMenu.font.mrEavesRemake',
        keywords: ['font'],
        style: { fontFamily: 'MrEavesRemake' },
        subtitle: 'editor.commandMenu.font.mrEavesRemake.subtitle',
        enabled: (editor: Editor) =>
          editor.can().setFontFamily('MrEavesRemake'),
        active: (editor: Editor) =>
          editor.isActive({ fontFamily: 'MrEavesRemake' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().setFontFamily('MrEavesRemake').run();
        },
      },
      allison: {
        title: 'editor.commandMenu.font.allison',
        keywords: ['font'],
        style: { fontFamily: 'Allison' },
        subtitle: 'editor.commandMenu.font.allison.subtitle',
        enabled: (editor: Editor) => editor.can().setFontFamily('Allison'),
        active: (editor: Editor) => editor.isActive({ fontFamily: 'Allison' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().setFontFamily('Allison').run();
        },
      },
      italianno: {
        title: 'editor.commandMenu.font.italianno',
        keywords: ['font'],
        style: { fontFamily: 'Italianno' },
        subtitle: 'editor.commandMenu.font.italianno.subtitle',
        enabled: (editor: Editor) => editor.can().setFontFamily('Italianno'),
        active: (editor: Editor) =>
          editor.isActive({ fontFamily: 'Italianno' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().setFontFamily('Italianno').run();
        },
      },
      monsieurLaDoulaise: {
        title: 'editor.commandMenu.font.monsieurLaDoulaise',
        keywords: ['font'],
        style: { fontFamily: 'Monsieur La Doulaise' },
        subtitle: 'editor.commandMenu.font.monsieurLaDoulaise.subtitle',
        enabled: (editor: Editor) =>
          editor.can().setFontFamily('Monsieur La Doulaise'),
        active: (editor: Editor) =>
          editor.isActive({ fontFamily: 'Monsieur La Doulaise' }),
        icon: undefined,
        command: (editor: Editor) => {
          editor.chain().focus().setFontFamily('Monsieur La Doulaise').run();
        },
      },
    },
    align: {
      left: {
        title: 'editor.commandMenu.align.left',
        keywords: ['align', 'left'],
        enabled: (editor: Editor) => editor.can().setTextAlign('left'),
        active: (editor: Editor) => editor.isActive({ textAlign: 'left' }),
        icon: RiAlignLeft,
        command: (editor: Editor) => {
          editor.chain().focus().setTextAlign('left').run();
        },
      },
      center: {
        title: 'editor.commandMenu.align.center',
        keywords: ['align', 'center'],
        enabled: (editor: Editor) => editor.can().setTextAlign('center'),
        active: (editor: Editor) => editor.isActive({ textAlign: 'center' }),
        icon: RiAlignCenter,
        command: (editor: Editor) => {
          editor.chain().focus().setTextAlign('center').run();
        },
      },
      right: {
        title: 'editor.commandMenu.align.right',
        keywords: ['align', 'right'],
        enabled: (editor: Editor) => editor.can().setTextAlign('right'),
        active: (editor: Editor) => editor.isActive({ textAlign: 'right' }),
        icon: RiAlignRight,
        command: (editor: Editor) => {
          editor.chain().focus().setTextAlign('right').run();
        },
      },
    },
    paragraph: {
      title: 'editor.commandMenu.paragraph',
      keywords: ['paragraph', 'p'],
      subtitle: 'editor.commandMenu.paragraph.subtitle',
      enabled: () => true,
      icon: RiParagraph,
      command: (editor: Editor, range: Range) => {
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
    heading: {
      h1: {
        title: 'editor.commandMenu.h1',
        keywords: ['h1', 'header'],
        subtitle: 'editor.commandMenu.h1.subtitle',
        enabled: () => true,
        icon: LuHeading1,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 1 })
            .run();
        },
      },
      h2: {
        title: 'editor.commandMenu.h2',
        keywords: ['h2', 'header'],
        subtitle: 'editor.commandMenu.h2.subtitle',
        enabled: () => true,
        icon: LuHeading2,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 2 })
            .run();
        },
      },
      h3: {
        title: 'editor.commandMenu.h3',
        keywords: ['h3', 'header'],
        subtitle: 'editor.commandMenu.h3.subtitle',
        enabled: () => true,
        icon: LuHeading3,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 3 })
            .run();
        },
      },
      h4: {
        title: 'editor.commandMenu.h4',
        keywords: ['h4', 'header'],
        subtitle: 'editor.commandMenu.h4.subtitle',
        enabled: () => true,
        icon: LuHeading4,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 4 })
            .run();
        },
      },
      h5: {
        title: 'editor.commandMenu.h5',
        keywords: ['h5', 'header'],
        subtitle: 'editor.commandMenu.h5.subtitle',
        enabled: () => true,
        icon: LuHeading5,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 5 })
            .run();
        },
      },
      h6: {
        title: 'editor.commandMenu.h6',
        keywords: ['h6', 'header'],
        subtitle: 'editor.commandMenu.h6.subtitle',
        enabled: () => true,
        icon: LuHeading6,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 6 })
            .run();
        },
      },
    },
    list: {
      bulletList: {
        title: 'editor.commandMenu.bulletList',
        keywords: ['list', 'bullet', 'unordered', 'ul', '-', '*'],
        subtitle: 'editor.commandMenu.bulletList.subtitle',
        enabled: (editor: Editor) => editor.can().toggleBulletList(),
        active: (editor: Editor) => editor.isActive('bulletList'),
        icon: LuList,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setParagraph()
            .toggleBulletList()
            .run();
        },
      },
      orderedList: {
        title: 'editor.commandMenu.orderedList',
        keywords: ['list', 'numbered', 'ordered', 'ol', '-', '*', '1'],
        subtitle: 'editor.commandMenu.orderedList.subtitle',
        enabled: (editor: Editor) => editor.can().toggleOrderedList(),
        active: (editor: Editor) => editor.isActive('orderedList'),
        icon: LuListOrdered,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setParagraph()
            .toggleOrderedList()
            .run();
        },
      },
      taskList: {
        title: 'editor.commandMenu.taskList',
        keywords: ['list', 'task', '-', '*', '['],
        subtitle: 'editor.commandMenu.taskList.subtitle',
        enabled: (editor: Editor) => editor.can().toggleTaskList(),
        active: (editor: Editor) => editor.isActive('taskList'),
        icon: RiListCheck2,
        command: (editor: Editor, range: Range) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setParagraph()
            .toggleOrderedList()
            .run();
        },
      },
    },
    sinkBlock: {
      title: 'editor.commandMenu.sinkBlock',
      keywords: ['indent'],
      subtitle: 'editor.commandMenu.sinkBlock.subtitle',
      enabled: () => true,
      icon: LuIndentIncrease,
      command: (editor: Editor) => {
        sinkBlockOrListItem(editor);
      },
    },
    liftBlock: {
      title: 'editor.commandMenu.liftBlock',
      keywords: ['outdent'],
      subtitle: 'editor.commandMenu.liftBlock.subtitle',
      enabled: () => true,
      icon: LuIndentDecrease,
      command: (editor: Editor) => {
        liftBlockOrListItem(editor);
      },
    },
  },
  edit: {
    undo: {
      title: 'editor.commandMenu.undo',
      keywords: [],
      enabled: () => true,
      icon: LuUndo,
      command: (editor: Editor) => {
        editor.chain().focus().undo().run();
      },
    },
    redo: {
      title: 'editor.commandMenu.redo',
      keywords: [],
      enabled: () => true,
      icon: LuRedo,
      command: (editor: Editor) => {
        editor.chain().focus().redo().run();
      },
    },
    cut: {
      title: 'editor.commandMenu.cut',
      keywords: [],
      enabled: () => true,
      icon: RiScissorsCutLine,
      command: (editor: Editor) => {
        editor.chain().focus().cut().run();
      },
    },
    copy: {
      title: 'editor.commandMenu.copy',
      keywords: [],
      enabled: () => true,
      icon: RiFileCopyLine,
      command: (editor: Editor) => {
        editor.chain().focus().copy().run();
      },
    },
    selectAll: {
      title: 'editor.commandMenu.selectAll',
      keywords: [],
      enabled: () => true,
      icon: RiBox1Line,
      command: (editor: Editor) => {
        editor.chain().focus().selectAll().run();
      },
    },
    delete: {
      title: 'editor.commandMenu.delete',
      keywords: [],
      enabled: () => true,
      icon: RiDeleteBackLine,
      command: (editor: Editor) => {
        editor.chain().focus().deleteRange(editor.state.selection).run();
      },
    },
  },
};
