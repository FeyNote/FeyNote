import { useTranslation } from 'react-i18next';
import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { ArtifactEditorStyles } from './ArtifactEditorStyles';
import { EditorContent } from '@tiptap/react';
import { useArtifactEditor } from './useTiptapEditor';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { getFileRedirectUrl } from '../../utils/files/getFileRedirectUrl';

interface Props {
  artifactId: string;
  yDoc: YDoc;
  previewText?: string;
}

export const TiptapPreview: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);

  const artifactMeta = getMetaFromYArtifact(props.yDoc);

  const editor = useArtifactEditor({
    artifactId: props.artifactId,
    editable: false,
    yjsProvider: undefined,
    yDoc: props.yDoc,
    getFileUrl: (fileId) => {
      if (!session) return '';
      return getFileRedirectUrl({
        fileId,
        sessionToken: session.token,
      }).toString();
    },
  });

  const showEditor =
    props.previewText !== undefined && props.previewText.trim().length;
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
