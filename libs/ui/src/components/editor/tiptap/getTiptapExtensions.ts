import * as Sentry from '@sentry/react';
import ParagraphExtension from '@tiptap/extension-paragraph';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import HighlightExtension from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Code from '@tiptap/extension-code';
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
import FileHandlerExtension from '@tiptap-pro/extension-file-handler';
import TableOfContentsExtension, {
  type TableOfContentData,
} from '@tiptap-pro/extension-table-of-contents';
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
import { Editor } from '@tiptap/core';
import { FeynoteImageExtension } from './extensions/feynoteImage/FeynoteImageExtension';
import { ClipboardExtension } from './extensions/clipboard/ClipboardExtension';
import { HyperlinkExtension } from './extensions/link/HyperlinkExtension';
import { previewHyperlinkModal } from './extensions/link/modals/previewHyperlink';
import { setHyperlinkModal } from './extensions/link/modals/setHyperlink';
import { FocusExtension } from './extensions/focus/FocusExtension';
import { DiceDecorationExtension } from './extensions/diceDecoration/DiceDecorationExtension';

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
  artifactId: string | undefined; // Passing undefined here will disable artifact reference text lookup
  placeholder: string;
  editable: boolean;
  y: DocArgOptions;
  collaborationUser: Record<string, string>;
  handleFileUpload?: (editor: Editor, files: File[], pos?: number) => void;
  getFileUrl: (fileId: string) => string;
  onTocUpdate?: (content: TableOfContentData) => void;
  onRollDice?: (roll: string) => void;
}) => {
  return [
    DocumentExtension,
    ParagraphExtension,
    BlockGroup,
    HeadingExtension,
    TextExtension,
    HorizontalRule,
    BlockquoteExtension,
    CodeBlock,
    Code,
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
    HyperlinkExtension.configure({
      hyperlinkOnPaste: false,
      openOnClick: true,
      modals: args.editable
        ? {
            previewHyperlink: previewHyperlinkModal,
            setHyperlink: setHyperlinkModal,
          }
        : undefined,
    }),
    TableExtension.configure({
      resizable: false,
      allowTableNodeSelection: false,
    }),
    TableRowExtension,
    TableHeaderExtension,
    TableCellExtension,
    HighlightExtension,
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
      artifactId: args.artifactId,
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
    ...(args.editable && args.handleFileUpload
      ? [
          FileHandlerExtension.configure({
            allowedMimeTypes: [
              'image/png',
              'image/jpeg',
              'image/gif',
              'image/webp',
            ],
            onDrop: args.handleFileUpload,
            onPaste: (currentEditor, files, htmlContent) => {
              args.handleFileUpload?.(currentEditor, files);

              if (htmlContent) {
                // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
                // you could extract the pasted file from this url string and upload it to a server for example
                // To hit this block, copy an image with right-click copy on an image
                console.log('Paste with htmlContent', htmlContent, files);
                Sentry.captureMessage('Paste with htmlContent', {
                  extra: {
                    htmlContent,
                    files,
                  },
                });
                return false;
              }
            },
          }),
        ]
      : []),
    FeynoteImageExtension.configure({
      getSrcForFileId: (fileId) => {
        return args.getFileUrl(fileId);
      },
    }),
    FocusExtension,
    ClipboardExtension,
    ...(args.onTocUpdate
      ? [
          TableOfContentsExtension.configure({
            onUpdate(content) {
              setTimeout(() => {
                args.onTocUpdate?.(content);
              });
            },
          }),
        ]
      : []),
    DiceDecorationExtension.configure({
      onRollDice: args.onRollDice,
    }),
  ];
};
