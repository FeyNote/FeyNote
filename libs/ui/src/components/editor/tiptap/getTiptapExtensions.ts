import * as Sentry from '@sentry/react';
import { ParagraphExtension } from './extensions/paragraph/ParagraphExtension';
import { Blockquote as BlockquoteExtension } from '@tiptap/extension-blockquote';
import { Highlight as HighlightExtension } from '@tiptap/extension-highlight';
import { CodeBlock as CodeBlockExtension } from '@tiptap/extension-code-block';
import { Code as CodeExtension } from '@tiptap/extension-code';
import {
  ListItem as ListItemExtension,
  OrderedList as OrderedListExtension,
  BulletList as BulletListExtension,
  TaskList as TaskListExtension,
  TaskItem as TaskItemExtension,
} from '@tiptap/extension-list';
import { HardBreak as HardBreakExtension } from '@tiptap/extension-hard-break';
import { Bold as BoldExtension } from '@tiptap/extension-bold';
import { FontFamily as FontFamilyExtension } from '@tiptap/extension-font-family';
import { TextStyle as TextStyleExtension } from '@tiptap/extension-text-style';
import { Italic as ItalicExtension } from '@tiptap/extension-italic';
import { Strike as StrikeExtension } from '@tiptap/extension-strike';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { TextAlign as TextAlignExtension } from '@tiptap/extension-text-align';
import { Dropcursor as DropcursorExtension } from '@tiptap/extension-dropcursor';
import { Gapcursor as GapcursorExtension } from '@tiptap/extension-gapcursor';
import { TableExtension } from './extensions/table/TableExtension';
import {
  TableHeader as TableHeaderExtension,
  TableRow as TableRowExtension,
  TableCell as TableCellExtension,
} from '@tiptap/extension-table';
import { Document as DocumentExtension } from '@tiptap/extension-document';
import { Placeholder as PlaceholderExtension } from '@tiptap/extensions';
import { Text as TextExtension } from '@tiptap/extension-text';
import { HorizontalRule as HorizontalRuleExtension } from '@tiptap/extension-horizontal-rule';
import { UniqueID as UniqueIDExtension } from '@tiptap/extension-unique-id';
import { FileHandler as FileHandlerExtension } from '@tiptap/extension-file-handler';
import {
  TableOfContents as TableOfContentsExtension,
  type TableOfContentData,
} from '@tiptap/extension-table-of-contents';
import {
  Collaboration as CollaborationExtension,
  isChangeOrigin,
} from '@tiptap/extension-collaboration';
import { CollaborationCaret as CollaborationCaretExtension } from '@tiptap/extension-collaboration-caret';
import { IndentationExtension } from './extensions/indentation/IndentationExtension';
import { buildArtifactReferencesExtension } from './extensions/artifactReferences/ArtifactReferencesExtension';
import { CommandsExtension } from './extensions/commands/CommandsExtension';
import { HeadingExtension } from './extensions/heading/HeadingExtension';
import { MonsterStatblockExtension } from './extensions/statsheet/monsterStatblock/MonsterStatblockExtension';
import { SpellSheetExtension } from './extensions/statsheet/spellSheet/SpellSheetExtension';
import { TTRPGNoteExtension } from './extensions/ttrpgNote/TTRPGNote';
import { IsolatingContainerBackspaceExtension } from './extensions/isolatingContainerBackspaceExtension';
import { BlockGroup } from './extensions/BlockGroup';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Doc as YDoc } from 'yjs';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  TiptapBlockType,
} from '@feynote/shared-utils';
import { Editor, type Extensions } from '@tiptap/core';
import { FeynoteImageExtension } from './extensions/feynoteImage/FeynoteImageExtension';
import { FeynoteVideoExtension } from './extensions/feynoteVideo/FeynoteVideoExtension';
import { ClipboardExtension } from './extensions/clipboard/ClipboardExtension';
import { HyperlinkExtension } from './extensions/link/HyperlinkExtension';
import { previewHyperlinkModal } from './extensions/link/modals/previewHyperlink';
import { setHyperlinkModal } from './extensions/link/modals/setHyperlink';
import { FocusExtension } from './extensions/focus/FocusExtension';
import { DiceDecorationExtension } from './extensions/diceDecoration/DiceDecorationExtension';
import { getEdgeStore } from '../../../utils/edgesReferences/edgeStore';
import { FeynoteGenericFileExtension } from './extensions/feynoteGenericFile/FeynoteGenericFileExtension';
import { FeynoteAudioExtension } from './extensions/feynoteAudio/FeynoteAudioExtension';

type DocArgOptions =
  | {
      yjsProvider: HocuspocusProvider;
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
  getFileUrl: (fileId: string) => Promise<string> | string;
  onTocUpdate?: (content: TableOfContentData) => void;
  onRollDice?: (roll: string) => void;
  /**
   * These both need to be stable references, as they will not be updated on future renders
   */
  onIncomingReferenceCounterMouseOver?: (
    event: MouseEvent,
    blockId: string,
  ) => void;
  onIncomingReferenceCounterMouseOut?: (event: MouseEvent) => void;
}): Extensions => {
  return [
    DocumentExtension,
    ParagraphExtension.configure({
      artifactId: args.artifactId,
      edgeStore: getEdgeStore(),
      onIncomingReferenceCounterMouseOver:
        args.onIncomingReferenceCounterMouseOver,
      onIncomingReferenceCounterMouseOut:
        args.onIncomingReferenceCounterMouseOut,
    }),
    HeadingExtension.configure({
      artifactId: args.artifactId,
      edgeStore: getEdgeStore(),
      onIncomingReferenceCounterMouseOver:
        args.onIncomingReferenceCounterMouseOver,
      onIncomingReferenceCounterMouseOut:
        args.onIncomingReferenceCounterMouseOut,
    }),
    BlockGroup,
    TextExtension,
    HorizontalRuleExtension,
    BlockquoteExtension,
    CodeBlockExtension,
    CodeExtension,
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
      types: [TiptapBlockType.Heading, TiptapBlockType.Paragraph],
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
    CollaborationExtension.configure({
      document: args.y.yDoc || args.y.yjsProvider.document,
      field: ARTIFACT_TIPTAP_BODY_KEY,
    }),
    ...(args.y.yjsProvider
      ? [
          CollaborationCaretExtension.configure({
            provider: args.y.yjsProvider,
            user: args.collaborationUser,
          }),
        ]
      : []),
    CommandsExtension,
    ...(args.artifactId
      ? [
          buildArtifactReferencesExtension({
            artifactId: args.artifactId,
            yDoc: args.y.yDoc || args.y.yjsProvider.document,
          }),
        ]
      : []),
    PlaceholderExtension.configure({
      placeholder: args.placeholder,
    }),
    UniqueIDExtension.configure({
      types: [
        TiptapBlockType.Heading,
        TiptapBlockType.Paragraph,
        TiptapBlockType.ArtifactReference,
      ],
      filterTransaction: (transaction) => !isChangeOrigin(transaction),
    }),
    MonsterStatblockExtension,
    SpellSheetExtension,
    TTRPGNoteExtension,
    IsolatingContainerBackspaceExtension,
    ...(args.editable && args.handleFileUpload
      ? [
          FileHandlerExtension.configure({
            allowedMimeTypes: undefined,
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
    FeynoteVideoExtension.configure({
      getSrcForFileId: (fileId) => {
        return args.getFileUrl(fileId);
      },
    }),
    FeynoteAudioExtension.configure({
      getSrcForFileId: (fileId) => {
        return args.getFileUrl(fileId);
      },
    }),
    FeynoteGenericFileExtension.configure({
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
