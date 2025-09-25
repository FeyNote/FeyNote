import { Button, DropdownMenu } from '@radix-ui/themes';
import type { Editor, Range } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { CgNotes } from 'react-icons/cg';
import { GiMonsterGrasp } from 'react-icons/gi';
import type { IconType } from 'react-icons/lib';
import {
  LuHeading,
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
} from 'react-icons/lu';
import { MdHorizontalRule } from 'react-icons/md';
import { RxMagicWand } from 'react-icons/rx';
import styled from 'styled-components';
import {
  liftBlockOrListItem,
  sinkBlockOrListItem,
} from './tiptap/extensions/indentation/IndentationExtension';
import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiBold,
  RiBox1Line,
  RiDeleteBackLine,
  RiFileCopyLine,
  RiFontFamily,
  RiItalic,
  RiLink,
  RiListCheck2,
  RiParagraph,
  RiPrinterLine,
  RiScissorsCutLine,
  RiStrikethrough,
  RiText,
  RiUnderline,
} from 'react-icons/ri';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';
import { openArtifactPrint } from '../../utils/openArtifactPrint';
import { Doc as YDoc } from 'yjs';
import { useContext } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { duplicateArtifact } from '../../utils/duplicateArtifact';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { createArtifact } from '../../utils/createArtifact';
import { IoAdd } from 'react-icons/io5';

type FeynoteEditorCommandEntry = {
  title: string;
  keywords: string[];
  subtitle?: string;
  enabled: (editor: Editor) => boolean;
  active?: (editor: Editor) => boolean;
  style?: { fontFamily: string };
  icon: IconType | undefined;
  command: (editor: Editor, range: Range) => void;
};

const globalEditorCommands = {
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

const ControlMenuList = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
`;

interface Props {
  artifactId: string;
  editor: Editor;
  yDoc: YDoc;
  authorizedScope: CollaborationConnectionAuthorizedScope;
}

export const ArtifactEditorControlMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(PaneContext);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const onNewArtifactClicked = async () => {
    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
      },
    });

    if (!result.id) {
      return;
    }

    navigate(
      PaneableComponent.Artifact,
      { id: result.id },
      PaneTransition.NewTab,
    );
  };

  const onDuplicateArtifactClicked = async () => {
    const id = await duplicateArtifact(props.yDoc).catch((e) => {
      handleTRPCErrors(e);
    });

    if (!id) {
      return;
    }

    navigate(PaneableComponent.Artifact, { id: id }, PaneTransition.NewTab);
  };

  const renderCommandEntryItem = (commandEntry: FeynoteEditorCommandEntry) => (
    <DropdownMenu.Item
      onClick={() =>
        commandEntry.command(props.editor, props.editor.state.selection)
      }
      disabled={!commandEntry.enabled(props.editor)}
    >
      {commandEntry.icon && <commandEntry.icon />}
      <span style={commandEntry.style}>{t(commandEntry.title)}</span>
    </DropdownMenu.Item>
  );

  const isEditable = [
    CollaborationConnectionAuthorizedScope.CoOwner,
    CollaborationConnectionAuthorizedScope.CoOwner,
  ].includes(props.authorizedScope);

  const file = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.file')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => onNewArtifactClicked()}>
          <IoAdd />
          {t('tiptapControlMenu.file.new')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onDuplicateArtifactClicked()}>
          <RiFileCopyLine />
          {t('tiptapControlMenu.file.duplicate')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => openArtifactPrint(props.artifactId)}>
          <RiPrinterLine />
          {t('tiptapControlMenu.file.print')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const edit = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.edit')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {renderCommandEntryItem(globalEditorCommands.edit.undo)}
        {renderCommandEntryItem(globalEditorCommands.edit.redo)}
        {renderCommandEntryItem(globalEditorCommands.edit.cut)}
        {renderCommandEntryItem(globalEditorCommands.edit.copy)}
        {renderCommandEntryItem(globalEditorCommands.edit.selectAll)}
        {renderCommandEntryItem(globalEditorCommands.edit.delete)}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const insert = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.insert')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {renderCommandEntryItem(globalEditorCommands.insert.hr)}
        {renderCommandEntryItem(globalEditorCommands.insert.table)}
        {renderCommandEntryItem(globalEditorCommands.insert.monster)}
        {renderCommandEntryItem(globalEditorCommands.insert.wideMonster)}
        {renderCommandEntryItem(globalEditorCommands.insert.spell)}
        {renderCommandEntryItem(globalEditorCommands.insert.note)}
        {renderCommandEntryItem(globalEditorCommands.insert.link)}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const format = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.format')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <RiText />
            {t('tiptapControlMenu.format.text')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalEditorCommands.format.text.toggleBold,
            )}
            {renderCommandEntryItem(
              globalEditorCommands.format.text.toggleItalic,
            )}
            {renderCommandEntryItem(
              globalEditorCommands.format.text.toggleUnderline,
            )}
            {renderCommandEntryItem(
              globalEditorCommands.format.text.toggleStrike,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <RiFontFamily />
            {t('tiptapControlMenu.format.font')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(globalEditorCommands.format.font.default)}
            {renderCommandEntryItem(globalEditorCommands.format.font.sans)}
            {renderCommandEntryItem(globalEditorCommands.format.font.serif)}
            {renderCommandEntryItem(
              globalEditorCommands.format.font.libreBaskerville,
            )}
            {renderCommandEntryItem(
              globalEditorCommands.format.font.mrEavesRemake,
            )}
            {renderCommandEntryItem(globalEditorCommands.format.font.allison)}
            {renderCommandEntryItem(globalEditorCommands.format.font.italianno)}
            {renderCommandEntryItem(
              globalEditorCommands.format.font.monsieurLaDoulaise,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <RiAlignLeft />
            {t('tiptapControlMenu.format.align')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(globalEditorCommands.format.align.left)}
            {renderCommandEntryItem(globalEditorCommands.format.align.center)}
            {renderCommandEntryItem(globalEditorCommands.format.align.right)}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />

        {renderCommandEntryItem(globalEditorCommands.format.paragraph)}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <LuHeading />
            {t('tiptapControlMenu.format.h')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(globalEditorCommands.format.heading.h1)}
            {renderCommandEntryItem(globalEditorCommands.format.heading.h2)}
            {renderCommandEntryItem(globalEditorCommands.format.heading.h3)}
            {renderCommandEntryItem(globalEditorCommands.format.heading.h4)}
            {renderCommandEntryItem(globalEditorCommands.format.heading.h5)}
            {renderCommandEntryItem(globalEditorCommands.format.heading.h6)}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <LuList />
            {t('tiptapControlMenu.format.list')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(globalEditorCommands.format.sinkBlock)}
            {renderCommandEntryItem(globalEditorCommands.format.liftBlock)}
            <DropdownMenu.Separator />
            {renderCommandEntryItem(
              globalEditorCommands.format.list.bulletList,
            )}
            {renderCommandEntryItem(
              globalEditorCommands.format.list.orderedList,
            )}
            {renderCommandEntryItem(globalEditorCommands.format.list.taskList)}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <ControlMenuList>
      {file}
      {isEditable && edit}
      {isEditable && insert}
      {isEditable && format}
    </ControlMenuList>
  );
};
