import { useEditor } from '@tiptap/react';
import ParagraphExtension from '@tiptap/extension-paragraph';
import BlockquoteExtension from '@tiptap/extension-blockquote';
import ListItemExtension from '@tiptap/extension-list-item';
import OrderedListExtension from '@tiptap/extension-ordered-list';
import BulletListExtension from '@tiptap/extension-bullet-list';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';
import HardBreakExtension from '@tiptap/extension-hard-break';
import BoldExtension from '@tiptap/extension-bold';
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
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  PreferenceNames,
} from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';

import { IndentationExtension } from './tiptap/extensions/indentation/IndentationExtension';
import { ArtifactReferencesExtension } from './tiptap/extensions/artifactReferences/ArtifactReferencesExtension';
import { CommandsExtension } from './tiptap/extensions/commands/CommandsExtension';
import { HeadingExtension } from './tiptap/extensions/heading/HeadingExtension';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';
import { useTranslation } from 'react-i18next';
import { MonsterStatblockExtension } from './tiptap/extensions/statsheet/monsterStatblock/MonsterStatblockExtension';
import { SpellSheetExtension } from './tiptap/extensions/statsheet/spellSheet/SpellSheetExtension';
import { TTRPGNoteExtension } from './tiptap/extensions/ttrpgNote/TTRPGNote';
import { TableExtension } from './tiptap/extensions/table/TableExtension';
import { IsolatingContainerBackspaceExtension } from './tiptap/extensions/isolatingContainerBackspaceExtension';
import { useContext, useEffect, useMemo } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { BlockGroup } from './tiptap/extensions/BlockGroup';

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc?: undefined;
    }
  | {
      yjsProvider?: undefined;
      yDoc: YDoc;
    };

type UseArtifactEditorArgs = {
  editable: boolean;
  knownReferences?: Map<string, KnownArtifactReference>;
  onReady?: () => void;
} & DocArgOptions;

export const useArtifactEditor = (args: UseArtifactEditorArgs) => {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);
  const { getPreference } = useContext(PreferencesContext);
  const knownReferences = useMemo(() => {
    return args.knownReferences ? args.knownReferences : new Map();
  }, [args.knownReferences]);

  const preferredUserColor = getPreference(PreferenceNames.CollaborationColor);

  const collaborationUser = useMemo(
    () => ({
      name: session ? session.email : t('generic.anonymous'),
      color: preferredUserColor,
    }),
    [],
  );

  const extensions = [
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
      document: args.yDoc || args.yjsProvider.document,
      field: ARTIFACT_TIPTAP_BODY_KEY,
    }),
    ...(args.yjsProvider
      ? [
          CollaborationCursor.configure({
            provider: args.yjsProvider,
            user: collaborationUser,
          }),
        ]
      : []),
    CommandsExtension,
    ArtifactReferencesExtension.configure({
      knownReferences,
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
    MonsterStatblockExtension,
    SpellSheetExtension,
    TTRPGNoteExtension,
    IsolatingContainerBackspaceExtension,
  ];

  const editor = useEditor({
    editable: args.editable,
    extensions,
    onCreate: () => {
      args.onReady?.();
    },
  });

  useEffect(() => {
    // "updateUser" command is dependent on yjs provider being instantiated
    if (!args.yjsProvider) return;
    editor?.commands.updateUser({
      name: session ? session.email : t('generic.anonymous'),
      color: preferredUserColor,
    });
  }, [session?.email, preferredUserColor]);

  return editor;
};
