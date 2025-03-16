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
  onReady?: () => void;
}

export const TiptapPreview: React.FC<Props> = (props) => {
  const { session } = useContext(SessionContext);

  const artifactMeta = getMetaFromYArtifact(props.yDoc);

  const editor = useArtifactEditor({
    artifactId: props.artifactId,
    editable: false,
    yjsProvider: undefined,
    yDoc: props.yDoc,
    onReady: props.onReady,
    getFileUrl: (fileId) => {
      if (!session) return '';
      return getFileRedirectUrl({
        fileId,
        sessionToken: session.token,
      }).toString();
    },
  });

  return (
    <ArtifactEditorContainer>
      <ArtifactEditorStyles data-theme={artifactMeta.theme}>
        <EditorContent editor={editor}></EditorContent>
      </ArtifactEditorStyles>
    </ArtifactEditorContainer>
  );
};
