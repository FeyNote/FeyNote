import { useEditor } from '@tiptap/react';
import ParagraphExtension from '@tiptap/extension-paragraph';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import BulletListExtension from '@tiptap/extension-bullet-list';
import HardBreakExtension from '@tiptap/extension-hard-break';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import DropcursorExtension from '@tiptap/extension-dropcursor';
import GapcursorExtension from '@tiptap/extension-gapcursor';
import TableExtension from '@tiptap/extension-table';
import TableRowExtension from '@tiptap/extension-table-row';
import TableHeaderExtension from '@tiptap/extension-table-header';
import TableCellExtension from '@tiptap/extension-table-cell';
import DocumentExtension from '@tiptap/extension-document';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import TextExtension from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import UniqueIDExtension from '@tiptap-pro/extension-unique-id';
import Collaboration, { isChangeOrigin } from '@tiptap/extension-collaboration';
import GlobalDragHandleExtension from 'tiptap-extension-global-drag-handle';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { ARTIFACT_TIPTAP_BODY_KEY } from '@feynote/shared-utils';
import * as Y from 'yjs';

import { IndentationExtension } from './tiptap/extensions/indentation/IndentationExtension';
import { ArtifactReferencesExtension } from './tiptap/extensions/artifactReferences/ArtifactReferencesExtension';
import { CommandsExtension } from './tiptap/extensions/commands/CommandsExtension';
import { HeadingExtension } from './tiptap/extensions/heading/HeadingExtension';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';
import { useTranslation } from 'react-i18next';

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc: undefined;
    }
  | {
      yjsProvider: undefined;
      yDoc: Y.Doc;
    };

type UseArtifactEditorArgs = {
  editable: boolean;
  knownReferences: Map<string, KnownArtifactReference>;
  onReady?: () => void;
} & DocArgOptions;

export const useArtifactEditor = (args: UseArtifactEditorArgs) => {
  const { t } = useTranslation();

  const extensions = [
    DocumentExtension,
    ParagraphExtension,
    HeadingExtension,
    TextExtension,
    HorizontalRule,
    BlockquoteExtension,
    ListItemExtension,
    OrderedListExtension,
    BulletListExtension,
    HardBreakExtension,
    BoldExtension,
    ItalicExtension,
    DropcursorExtension,
    GapcursorExtension,
    TableExtension.configure({
      resizable: true,
    }),
    TableRowExtension,
    TableHeaderExtension,
    TableCellExtension,
    IndentationExtension,
    GlobalDragHandleExtension,
    Collaboration.configure({
      document: args.yDoc || args.yjsProvider.document,
      field: ARTIFACT_TIPTAP_BODY_KEY,
    }),
    ...(args.yjsProvider
      ? [
          CollaborationCursor.configure({
            provider: args.yjsProvider,
            user: {
              name: 'Cyndi Lauper',
              color: '#f783ac',
            },
          }),
        ]
      : []),
    CommandsExtension,
    ArtifactReferencesExtension.configure({
      knownReferences: args.knownReferences,
    }),
    PlaceholderExtension.configure({
      placeholder: args.editable
        ? t('editor.placeholder')
        : t('editor.placeholder.readOnlyEmpty'),
    }),
    UniqueIDExtension.configure({
      types: ['heading', 'paragraph', 'artifactReference'],
      filterTransaction: (transaction) => !isChangeOrigin(transaction),
    }),
  ];

  return useEditor({
    editable: args.editable,
    extensions,
    onCreate: () => {
      args.onReady?.();
    },
  });
};
