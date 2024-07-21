import { MutableRefObject } from 'react';
import { EditorContent } from '@tiptap/react';
import { JSONContent } from '@tiptap/core';
import { HocuspocusProvider } from '@hocuspocus/provider';

import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { KnownArtifactReference } from './tiptap/extensions/artifactReferences/KnownArtifactReference';
import { useArtifactEditor } from './useTiptapEditor';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { DragHandle } from './tiptap/extensions/globalDragHandle/DragHandle';
import { ArtifactTheme } from '@feynote/shared-utils';

export type ArtifactEditorApplyTemplate = (
  template: string | JSONContent,
) => void;

interface Props {
  knownReferences: Map<string, KnownArtifactReference>;
  yProvider: HocuspocusProvider;
  theme: ArtifactTheme;
  applyTemplateRef?: MutableRefObject<ArtifactEditorApplyTemplate | undefined>;
  onReady?: () => void;
}

export const ArtifactEditor: React.FC<Props> = (props) => {
  const editor = useArtifactEditor({
    editable: true,
    knownReferences: props.knownReferences,
    yProvider: props.yProvider,
    yDoc: undefined,
    onReady: props.onReady,
  });

  if (props.applyTemplateRef) {
    props.applyTemplateRef.current = (template) => {
      editor?.commands.setContent(template);
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
};
