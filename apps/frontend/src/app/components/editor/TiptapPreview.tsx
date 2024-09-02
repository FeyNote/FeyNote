import { useTranslation } from 'react-i18next';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { EditorContent } from '@tiptap/react';
import { useArtifactEditor } from './useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifact } from '@feynote/shared-utils';

interface Props {
  yDoc: YDoc;
  previewText?: string;
}

export const TiptapPreview: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const artifactMeta = getMetaFromYArtifact(props.yDoc);

  const editor = useArtifactEditor({
    editable: false,
    knownReferences: new Map(), // TODO: Update this
    yjsProvider: undefined,
    yDoc: props.yDoc,
  });

  const showEditor =
    props.previewText !== undefined && !props.previewText.trim().length;
  return showEditor ? (
    <ArtifactEditorContainer>
      <ArtifactEditorStyles data-theme={artifactMeta.theme}>
        <EditorContent editor={editor}></EditorContent>
      </ArtifactEditorStyles>
    </ArtifactEditorContainer>
  ) : (
    <span>{t('artifactReferencePreview.noContent')}</span>
  );
};
