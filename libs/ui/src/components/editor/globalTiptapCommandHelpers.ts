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
  RiInsertColumnLeft,
  RiTableFill,
  CgExtensionRemove,
  RiLayoutColumnFill,
  RiLayoutRowFill,
  RiDeleteRow,
  RiInsertRowBottom,
  RiInsertRowTop,
  RiDeleteColumn,
  RiInsertColumnRight,
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
  command: (args: { editor: Editor; range: Range }) => void;
};

export const globalTiptapCommandHelpers = {
  insert: {
    hr: {
      title: 'editor.commandMenu.hr',
      keywords: ['hr', '-'],
      subtitle: 'editor.commandMenu.hr.subtitle',
      enabled: (editor) => !editor.isActive('table'),
      icon: MdHorizontalRule,
      command: (args) => {
        args.editor
          .chain()
          .focus()
          .deleteRange(args.range)
          .setHorizontalRule()
          .run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    table: {
      title: 'editor.commandMenu.table',
      keywords: [],
      subtitle: 'editor.commandMenu.table.subtitle',
      enabled: (editor) => !editor.isActive('table'),
      icon: LuTable,
      command: (args) => {
        args.editor
          .chain()
          .focus()
          .deleteRange(args.range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    monster: {
      title: 'editor.commandMenu.monster',
      keywords: ['stats'],
      subtitle: 'editor.commandMenu.monster.subtitle',
      enabled: (editor) => !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: (args) => {
        args.editor
          .chain()
          .focus()
          .deleteRange(args.range)
          .setMonsterStatblock()
          .run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    wideMonster: {
      title: 'editor.commandMenu.wideMonster',
      keywords: ['stats'],
      subtitle: 'editor.commandMenu.wideMonster.subtitle',
      enabled: (editor) => !editor.isActive('table'),
      icon: GiMonsterGrasp,
      command: (args) => {
        args.editor
          .chain()
          .focus()
          .deleteRange(args.range)
          .setMonsterStatblock(true)
          .run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    spell: {
      title: 'editor.commandMenu.spell',
      keywords: [],
      subtitle: 'editor.commandMenu.spell.subtitle',
      enabled: (editor) => !editor.isActive('table'),
      icon: RxMagicWand,
      command: (args) => {
        args.editor
          .chain()
          .focus()
          .deleteRange(args.range)
          .setSpellSheet()
          .run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    note: {
      title: 'editor.commandMenu.note',
      keywords: [],
      subtitle: 'editor.commandMenu.note.subtitle',
      enabled: (editor) => !editor.isActive('table'),
      icon: CgNotes,
      command: (args) => {
        args.editor
          .chain()
          .focus()
          .deleteRange(args.range)
          .setTTRPGNote()
          .run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    link: {
      title: 'editor.commandMenu.link',
      keywords: [],
      subtitle: 'editor.commandMenu.link.subtitle',
      enabled: () => true,
      active: (editor) => editor.isActive('link'),
      icon: RiLink,
      command: () => {
        // You must override this method as it requires additional interactivity.
        // See CreateLinkDialog
      },
    } satisfies GlobalTiptapCommandHelperEntry,
  },
  format: {
    text: {
      toggleBold: {
        title: 'editor.commandMenu.bold',
        keywords: ['bold'],
        enabled: (editor) => editor.can().toggleBold(),
        icon: RiBold,
        command: (args) => {
          args.editor.chain().focus().toggleBold().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      toggleItalic: {
        title: 'editor.commandMenu.italic',
        keywords: ['italic'],
        enabled: (editor) => editor.can().toggleItalic(),
        icon: RiItalic,
        command: (args) => {
          args.editor.chain().focus().toggleItalic().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      toggleUnderline: {
        title: 'editor.commandMenu.underline',
        keywords: ['italic'],
        enabled: (editor) => editor.can().toggleUnderline(),
        icon: RiUnderline,
        command: (args) => {
          args.editor.chain().focus().toggleUnderline().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      toggleStrike: {
        title: 'editor.commandMenu.strike',
        keywords: ['italic'],
        enabled: (editor) => editor.can().toggleStrike(),
        icon: RiStrikethrough,
        command: (args) => {
          args.editor.chain().focus().toggleStrike().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
    },
    table: {
      insertColBefore: {
        title: 'editor.tableBubbleMenu.insertColBefore',
        keywords: ['table'],
        enabled: (editor) => editor.can().addColumnBefore(),
        icon: RiInsertColumnLeft,
        command: (args) => {
          args.editor.chain().focus().addColumnBefore().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      insertColAfter: {
        title: 'editor.tableBubbleMenu.insertColAfter',
        keywords: ['table'],
        enabled: (editor) => editor.can().addColumnAfter(),
        icon: RiInsertColumnRight,
        command: (args) => {
          args.editor.chain().focus().addColumnAfter().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      deleteCol: {
        title: 'editor.tableBubbleMenu.deleteCol',
        keywords: ['table'],
        enabled: (editor) => editor.can().deleteColumn(),
        icon: RiDeleteColumn,
        command: (args) => {
          args.editor.chain().focus().deleteColumn().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      insertRowAbove: {
        title: 'editor.tableBubbleMenu.insertRowAbove',
        keywords: ['table'],
        enabled: (editor) => editor.can().addRowBefore(),
        icon: RiInsertRowTop,
        command: (args) => {
          args.editor.chain().focus().addRowBefore().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      insertRowBelow: {
        title: 'editor.tableBubbleMenu.insertRowBelow',
        keywords: ['table'],
        enabled: (editor) => editor.can().addRowAfter(),
        icon: RiInsertRowBottom,
        command: (args) => {
          args.editor.chain().focus().addRowAfter().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      deleteRow: {
        title: 'editor.tableBubbleMenu.deleteRow',
        keywords: ['table'],
        enabled: (editor) => editor.can().deleteRow(),
        icon: RiDeleteRow,
        command: (args) => {
          args.editor.chain().focus().deleteRow().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      toggleHeaderRow: {
        title: 'editor.tableBubbleMenu.toggleHeaderRow',
        keywords: ['table'],
        enabled: (editor) => editor.can().toggleHeaderRow(),
        icon: RiLayoutRowFill,
        command: (args) => {
          args.editor.chain().focus().toggleHeaderRow().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      toggleHeaderCol: {
        title: 'editor.tableBubbleMenu.toggleHeaderCol',
        keywords: ['table'],
        enabled: (editor) => editor.can().toggleHeaderColumn(),
        icon: RiLayoutColumnFill,
        command: (args) => {
          args.editor.chain().focus().toggleHeaderColumn().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      toggleHeaderCell: {
        title: 'editor.tableBubbleMenu.toggleHeaderCell',
        keywords: ['table'],
        enabled: (editor) => editor.can().toggleHeaderCell(),
        active: (editor) => editor.isActive('tableHeader'),
        icon: RiTableFill,
        command: (args) => {
          args.editor.chain().focus().toggleHeaderCell().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      deleteTable: {
        title: 'editor.tableBubbleMenu.deleteTable',
        keywords: ['table'],
        enabled: (editor) => editor.can().deleteTable(),
        icon: CgExtensionRemove,
        command: (args) => {
          args.editor.chain().focus().deleteTable().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
    },
    font: {
      default: {
        title: 'editor.commandMenu.font.default',
        keywords: ['font'],
        subtitle: 'editor.commandMenu.font.default.subtitle',
        enabled: (editor) => editor.can().unsetFontFamily(),
        active: (editor) => editor.isActive({ fontFamily: '' }),
        icon: undefined,
        command: (args) => {
          args.editor.chain().focus().unsetFontFamily().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      sans: {
        title: 'editor.commandMenu.font.sans',
        keywords: ['font'],
        style: { fontFamily: 'Roboto, Helvetica Neue, sans-serif' },
        subtitle: 'editor.commandMenu.font.sans.subtitle',
        enabled: (editor) =>
          editor.can().setFontFamily('Roboto, Helvetica Neue, sans-serif'),
        active: (editor) =>
          editor.isActive({ fontFamily: 'Roboto, Helvetica Neue, sans-serif' }),
        icon: undefined,
        command: (args) => {
          args.editor
            .chain()
            .focus()
            .setFontFamily('Roboto, Helvetica Neue, sans-serif')
            .run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      serif: {
        title: 'editor.commandMenu.font.serif',
        keywords: ['font'],
        style: { fontFamily: 'Times, serif' },
        subtitle: 'editor.commandMenu.font.serif.subtitle',
        enabled: (editor) => editor.can().setFontFamily('Times, serif'),
        active: (editor) => editor.isActive({ fontFamily: 'Times, serif' }),
        icon: undefined,
        command: (args) => {
          args.editor.chain().focus().setFontFamily('Times, serif').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      libreBaskerville: {
        title: 'editor.commandMenu.font.libreBaskerville',
        keywords: ['font'],
        style: { fontFamily: 'Libre Baskerville' },
        subtitle: 'editor.commandMenu.font.libreBaskerville.subtitle',
        enabled: (editor) => editor.can().setFontFamily('Libre Baskerville'),
        active: (editor) =>
          editor.isActive({ fontFamily: 'Libre Baskerville' }),
        icon: undefined,
        command: (args) => {
          args.editor.chain().focus().setFontFamily('Libre Baskerville').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      mrEavesRemake: {
        title: 'editor.commandMenu.font.mrEavesRemake',
        keywords: ['font'],
        style: { fontFamily: 'MrEavesRemake' },
        subtitle: 'editor.commandMenu.font.mrEavesRemake.subtitle',
        enabled: (editor) => editor.can().setFontFamily('MrEavesRemake'),
        active: (editor) => editor.isActive({ fontFamily: 'MrEavesRemake' }),
        icon: undefined,
        command: (args) => {
          args.editor.chain().focus().setFontFamily('MrEavesRemake').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      allison: {
        title: 'editor.commandMenu.font.allison',
        keywords: ['font'],
        style: { fontFamily: 'Allison' },
        subtitle: 'editor.commandMenu.font.allison.subtitle',
        enabled: (editor) => editor.can().setFontFamily('Allison'),
        active: (editor) => editor.isActive({ fontFamily: 'Allison' }),
        icon: undefined,
        command: (args) => {
          args.editor.chain().focus().setFontFamily('Allison').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      italianno: {
        title: 'editor.commandMenu.font.italianno',
        keywords: ['font'],
        style: { fontFamily: 'Italianno' },
        subtitle: 'editor.commandMenu.font.italianno.subtitle',
        enabled: (editor) => editor.can().setFontFamily('Italianno'),
        active: (editor) => editor.isActive({ fontFamily: 'Italianno' }),
        icon: undefined,
        command: (args) => {
          args.editor.chain().focus().setFontFamily('Italianno').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      monsieurLaDoulaise: {
        title: 'editor.commandMenu.font.monsieurLaDoulaise',
        keywords: ['font'],
        style: { fontFamily: 'Monsieur La Doulaise' },
        subtitle: 'editor.commandMenu.font.monsieurLaDoulaise.subtitle',
        enabled: (editor) => editor.can().setFontFamily('Monsieur La Doulaise'),
        active: (editor) =>
          editor.isActive({ fontFamily: 'Monsieur La Doulaise' }),
        icon: undefined,
        command: (args) => {
          args.editor
            .chain()
            .focus()
            .setFontFamily('Monsieur La Doulaise')
            .run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
    },
    align: {
      left: {
        title: 'editor.commandMenu.align.left',
        keywords: ['align', 'left'],
        enabled: (editor) => editor.can().setTextAlign('left'),
        active: (editor) => editor.isActive({ textAlign: 'left' }),
        icon: RiAlignLeft,
        command: (args) => {
          args.editor.chain().focus().setTextAlign('left').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      center: {
        title: 'editor.commandMenu.align.center',
        keywords: ['align', 'center'],
        enabled: (editor) => editor.can().setTextAlign('center'),
        active: (editor) => editor.isActive({ textAlign: 'center' }),
        icon: RiAlignCenter,
        command: (args) => {
          args.editor.chain().focus().setTextAlign('center').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      right: {
        title: 'editor.commandMenu.align.right',
        keywords: ['align', 'right'],
        enabled: (editor) => editor.can().setTextAlign('right'),
        active: (editor) => editor.isActive({ textAlign: 'right' }),
        icon: RiAlignRight,
        command: (args) => {
          args.editor.chain().focus().setTextAlign('right').run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
    },
    paragraph: {
      title: 'editor.commandMenu.paragraph',
      keywords: ['paragraph', 'p'],
      subtitle: 'editor.commandMenu.paragraph.subtitle',
      enabled: () => true,
      icon: RiParagraph,
      command: (args) => {
        const chain = args.editor.chain().focus();
        if (args.editor.isActive('bulletList')) {
          chain.lift('bulletList');
        }
        if (args.editor.isActive('orderedList')) {
          chain.lift('orderedList');
        }
        if (args.editor.isActive('taskList')) {
          chain.lift('taskList');
        }
        chain.run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    heading: {
      h1: {
        title: 'editor.commandMenu.h1',
        keywords: ['h1', 'header'],
        subtitle: 'editor.commandMenu.h1.subtitle',
        enabled: () => true,
        icon: LuHeading1,
        command: (args) => {
          args.editor.chain().focus().setHeading({ level: 1 }).run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      h2: {
        title: 'editor.commandMenu.h2',
        keywords: ['h2', 'header'],
        subtitle: 'editor.commandMenu.h2.subtitle',
        enabled: () => true,
        icon: LuHeading2,
        command: (args) => {
          args.editor.chain().focus().setHeading({ level: 2 }).run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      h3: {
        title: 'editor.commandMenu.h3',
        keywords: ['h3', 'header'],
        subtitle: 'editor.commandMenu.h3.subtitle',
        enabled: () => true,
        icon: LuHeading3,
        command: (args) => {
          args.editor.chain().focus().setHeading({ level: 3 }).run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      h4: {
        title: 'editor.commandMenu.h4',
        keywords: ['h4', 'header'],
        subtitle: 'editor.commandMenu.h4.subtitle',
        enabled: () => true,
        icon: LuHeading4,
        command: (args) => {
          args.editor.chain().focus().setHeading({ level: 4 }).run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      h5: {
        title: 'editor.commandMenu.h5',
        keywords: ['h5', 'header'],
        subtitle: 'editor.commandMenu.h5.subtitle',
        enabled: () => true,
        icon: LuHeading5,
        command: (args) => {
          args.editor.chain().focus().setHeading({ level: 5 }).run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      h6: {
        title: 'editor.commandMenu.h6',
        keywords: ['h6', 'header'],
        subtitle: 'editor.commandMenu.h6.subtitle',
        enabled: () => true,
        icon: LuHeading6,
        command: (args) => {
          args.editor.chain().focus().setHeading({ level: 6 }).run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
    },
    list: {
      bulletList: {
        title: 'editor.commandMenu.bulletList',
        keywords: ['list', 'bullet', 'unordered', 'ul', '-', '*'],
        subtitle: 'editor.commandMenu.bulletList.subtitle',
        enabled: (editor) => editor.can().toggleBulletList(),
        active: (editor) => editor.isActive('bulletList'),
        icon: LuList,
        command: (args) => {
          args.editor.chain().focus().setParagraph().toggleBulletList().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      orderedList: {
        title: 'editor.commandMenu.orderedList',
        keywords: ['list', 'numbered', 'ordered', 'ol', '-', '*', '1'],
        subtitle: 'editor.commandMenu.orderedList.subtitle',
        enabled: (editor) => editor.can().toggleOrderedList(),
        active: (editor) => editor.isActive('orderedList'),
        icon: LuListOrdered,
        command: (args) => {
          args.editor.chain().focus().setParagraph().toggleOrderedList().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
      taskList: {
        title: 'editor.commandMenu.taskList',
        keywords: ['list', 'task', '-', '*', '['],
        subtitle: 'editor.commandMenu.taskList.subtitle',
        enabled: (editor) => editor.can().toggleTaskList(),
        active: (editor) => editor.isActive('taskList'),
        icon: RiListCheck2,
        command: (args) => {
          args.editor.chain().focus().setParagraph().toggleOrderedList().run();
        },
      } satisfies GlobalTiptapCommandHelperEntry,
    },
    sinkBlock: {
      title: 'editor.commandMenu.sinkBlock',
      keywords: ['indent'],
      subtitle: 'editor.commandMenu.sinkBlock.subtitle',
      enabled: () => true,
      icon: LuIndentIncrease,
      command: (args) => {
        sinkBlockOrListItem(args.editor);
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    liftBlock: {
      title: 'editor.commandMenu.liftBlock',
      keywords: ['outdent'],
      subtitle: 'editor.commandMenu.liftBlock.subtitle',
      enabled: () => true,
      icon: LuIndentDecrease,
      command: (args) => {
        liftBlockOrListItem(args.editor);
      },
    } satisfies GlobalTiptapCommandHelperEntry,
  },
  edit: {
    undo: {
      title: 'editor.commandMenu.undo',
      keywords: [],
      enabled: () => true,
      icon: LuUndo,
      command: (args) => {
        args.editor.chain().focus().undo().run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    redo: {
      title: 'editor.commandMenu.redo',
      keywords: [],
      enabled: () => true,
      icon: LuRedo,
      command: (args) => {
        args.editor.chain().focus().redo().run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    cut: {
      title: 'editor.commandMenu.cut',
      keywords: [],
      enabled: () => true,
      icon: RiScissorsCutLine,
      command: (args) => {
        args.editor.chain().focus().cut().run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    copy: {
      title: 'editor.commandMenu.copy',
      keywords: [],
      enabled: () => true,
      icon: RiFileCopyLine,
      command: (args) => {
        args.editor.chain().focus().copy().run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    selectAll: {
      title: 'editor.commandMenu.selectAll',
      keywords: [],
      enabled: () => true,
      icon: RiBox1Line,
      command: (args) => {
        args.editor.chain().focus().selectAll().run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
    delete: {
      title: 'editor.commandMenu.delete',
      keywords: [],
      enabled: () => true,
      icon: RiDeleteBackLine,
      command: (args) => {
        args.editor.chain().focus().deleteRange(args.range).run();
      },
    } satisfies GlobalTiptapCommandHelperEntry,
  },
};
