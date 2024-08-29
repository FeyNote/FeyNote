import { memo, MutableRefObject } from 'react';
import type { ArtifactTheme } from '@prisma/client';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import { TiptapCollabProvider } from '@hocuspocus/provider';

import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';
import { useArtifactEditor } from './useTiptapEditor';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { DragHandle } from './tiptap/extensions/globalDragHandle/DragHandle';
import { Doc as YDoc } from 'yjs';

export type ArtifactEditorSetContent = (template: string | JSONContent) => void;

type DocArgOptions =
  | {
      yjsProvider: TiptapCollabProvider;
      yDoc: undefined;
    }
  | {
      yjsProvider: undefined;
      yDoc: YDoc;
    };

type Props = {
  theme: ArtifactTheme;
  setContentRef?: MutableRefObject<ArtifactEditorSetContent | undefined>;
  editable: boolean;
  knownReferences: Map<string, KnownArtifactReference>;
  onReady?: () => void;
} & DocArgOptions;

export const ArtifactEditor: React.FC<Props> = memo((props) => {
  const editor = useArtifactEditor({
    ...props,
  });

  if (props.setContentRef) {
    props.setContentRef.current = (content) => {
      editor?.commands.setContent(content);
    };
  }

  return (
    <ArtifactEditorContainer>
      <ArtifactEditorStyles data-theme={props.theme}>
        <EditorContent editor={editor}></EditorContent>
        <DragHandle />
      </ArtifactEditorStyles>
    </ArtifactEditorContainer>
  );
});
