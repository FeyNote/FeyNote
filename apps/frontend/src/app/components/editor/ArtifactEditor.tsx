import { IonCard, useIonToast } from '@ionic/react';
import styled from 'styled-components';
import { MutableRefObject, useEffect } from 'react';
import { ArtifactTheme } from '@prisma/client';
import { useEditor, EditorContent } from '@tiptap/react';
import Paragraph from '@tiptap/extension-paragraph';
import Blockquote from '@tiptap/extension-blockquote';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import HardBreak from '@tiptap/extension-hard-break';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Indent } from './tiptap/extensionIndentation';
import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import Collaboration, { isChangeOrigin } from '@tiptap/extension-collaboration';
import { ReferencesPlugin } from './tiptap/referenceList/ReferencesPlugin';
import { CommandsPlugin } from './tiptap/commandList/CommandsPlugin';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { HeadingPlugin } from './tiptap/extensionHeading';
import UniqueID from '@tiptap-pro/extension-unique-id';
import { KnownArtifactReference } from './tiptap/referenceList/KnownArtifactReference';
import { ARTIFACT_TIPTAP_BODY_KEY } from '@feynote/shared-utils';
import { JSONContent } from '@tiptap/core';

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
      Document,
      Paragraph,
      HeadingPlugin,
      Text,
      HorizontalRule,
      Blockquote,
      ListItem,
      OrderedList,
      BulletList,
      HardBreak,
      Bold,
      Italic,
      Dropcursor,
      Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Indent,
      GlobalDragHandle,
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
      CommandsPlugin,
      ReferencesPlugin.configure({
        knownReferences: props.knownReferences,
      }),
      Placeholder.configure({
        placeholder:
          'Write something … It’ll be shared with everyone else looking at this example.',
      }),
      UniqueID.configure({
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
