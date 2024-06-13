import { IonCard, useIonToast } from '@ionic/react';
import styled from 'styled-components';
import { MutableRefObject } from 'react';
import { ArtifactTheme } from '@prisma/client';
import { useEditor, EditorContent } from '@tiptap/react';
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
import { JSONContent } from '@tiptap/core';
import GlobalDragHandleExtension from 'tiptap-extension-global-drag-handle';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

import { ARTIFACT_TIPTAP_BODY_KEY } from '@feynote/shared-utils';
import { IndentationExtension } from './tiptap/extensions/IndentationExtension';
import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { ArtifactReferencesExtension } from './tiptap/extensions/artifactReferences/ArtifactReferencesExtension';
import { CommandsExtension } from './tiptap/extensions/commands/CommandsExtension';
import { HeadingExtension } from './tiptap/extensions/HeadingExtension';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';

const StyledIonCard = styled(IonCard)`
  contain: unset;
  overflow: visible;
`;

export type ArtifactEditorApplyTemplate = (
  template: string | JSONContent,
) => void;

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  yjsProvider: TiptapCollabProvider;
  theme: ArtifactTheme;
  applyTemplateRef?: MutableRefObject<ArtifactEditorApplyTemplate | undefined>;
  onReady?: () => void;
}

export const ArtifactEditor: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();

  const editor = useEditor({
    extensions: [
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
        document: props.yjsProvider.document,
        field: ARTIFACT_TIPTAP_BODY_KEY,
      }),
      CollaborationCursor.configure({
        provider: props.yjsProvider,
        user: {
          name: 'Cyndi Lauper',
          color: '#f783ac',
        },
      }),
      CommandsExtension,
      ArtifactReferencesExtension.configure({
        knownReferences: props.knownReferences,
      }),
      PlaceholderExtension.configure({
        placeholder:
          'Write something … It’ll be shared with everyone else looking at this example.',
      }),
      UniqueIDExtension.configure({
        types: ['heading', 'paragraph', 'artifactReference'],
        filterTransaction: (transaction) => !isChangeOrigin(transaction),
      }),
    ],
    onCreate: () => {
      props.onReady?.();
    },
  });

  if (props.applyTemplateRef) {
    props.applyTemplateRef.current = (template) => {
      editor?.commands.setContent(template);
    };
  }

  return (
    <StyledIonCard>
      <ArtifactEditorStyles>
        <EditorContent editor={editor}></EditorContent>
      </ArtifactEditorStyles>
    </StyledIonCard>
  );
};
