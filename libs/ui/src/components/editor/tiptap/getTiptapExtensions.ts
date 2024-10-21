import ParagraphExtension from '@tiptap/extension-paragraph';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import BulletListExtension from '@tiptap/extension-bullet-list';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import HardBreakExtension from '@tiptap/extension-hard-break';
import BoldExtension from '@tiptap/extension-bold';
import FontFamilyExtension from '@tiptap/extension-font-family';
import TextStyleExtension from '@tiptap/extension-text-style';
import ItalicExtension from '@tiptap/extension-italic';
import StrikeExtension from '@tiptap/extension-strike';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import TableRowExtension from '@tiptap/extension-table-row';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableCellExtension from '@tiptap/extension-table-cell';
import DocumentExtension from '@tiptap/extension-document';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import TextExtension from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import UniqueIDExtension from '@tiptap-pro/extension-unique-id';
import LinkExtension from '@tiptap/extension-link';
import Collaboration, { isChangeOrigin } from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { IndentationExtension } from './extensions/indentation/IndentationExtension';
import { ArtifactReferencesExtension } from './extensions/artifactReferences/ArtifactReferencesExtension';
import { CommandsExtension } from './extensions/commands/CommandsExtension';
import { HeadingExtension } from './extensions/heading/HeadingExtension';
import { MonsterStatblockExtension } from './extensions/statsheet/monsterStatblock/MonsterStatblockExtension';
import { SpellSheetExtension } from './extensions/statsheet/spellSheet/SpellSheetExtension';
import { TTRPGNoteExtension } from './extensions/ttrpgNote/TTRPGNote';
import { TableExtension } from './extensions/table/TableExtension';
import { IsolatingContainerBackspaceExtension } from './extensions/isolatingContainerBackspaceExtension';
import { BlockGroup } from './extensions/BlockGroup';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import { ARTIFACT_TIPTAP_BODY_KEY } from '@feynote/shared-utils';
import { KnownArtifactReference } from './extensions/artifactReferences/KnownArtifactReference';

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    };

export const getTiptapExtensions = (args: {
  placeholder: string;
  editable: boolean;
  y: DocArgOptions;
  collaborationUser: Record<string, string>;
  knownReferences: Map<string, KnownArtifactReference>;
}) => {
  return [
    DocumentExtension,
    ParagraphExtension,
    BlockGroup,
    HeadingExtension,
    TextExtension,
    HorizontalRule,
    BlockquoteExtension,
    ListItemExtension,
    OrderedListExtension,
    BulletListExtension,
    TextStyleExtension,
    FontFamilyExtension,
    TaskListExtension,
    TaskItemExtension.configure({
      nested: true,
    }),
    HardBreakExtension,
    BoldExtension,
    ItalicExtension,
    StrikeExtension,
    UnderlineExtension,
    TextAlignExtension.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
    }),
    DropcursorExtension,
    GapcursorExtension,
    LinkExtension,
    TableExtension.configure({
      resizable: false,
      allowTableNodeSelection: false,
    }),
    TableRowExtension,
    TableHeaderExtension,
    TableCellExtension,
    IndentationExtension,
    Collaboration.configure({
      document: args.y.yDoc || args.y.yjsProvider.document,
      field: ARTIFACT_TIPTAP_BODY_KEY,
    }),
    ...(args.y.yjsProvider
      ? [
          CollaborationCursor.configure({
            provider: args.y.yjsProvider,
            user: args.collaborationUser,
          }),
        ]
      : []),
    CommandsExtension,
    ArtifactReferencesExtension.configure({
      knownReferences: args.knownReferences,
    }),
    PlaceholderExtension.configure({
      placeholder: args.placeholder,
    }),
    UniqueIDExtension.configure({
      types: ['heading', 'paragraph', 'artifactReference'],
      filterTransaction: (transaction) => !isChangeOrigin(transaction),
    }),
    MonsterStatblockExtension,
    SpellSheetExtension,
    TTRPGNoteExtension,
    IsolatingContainerBackspaceExtension,
  ];
};
