import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { useContext } from 'react';
import { SessionContext } from '../../context/session/SessionContext';
import { getFileRedirectUrl } from '../../utils/files/getFileRedirectUrl';
import { TiptapEditor } from './TiptapEditor';

interface Props {
  artifactId: string;
  yDoc: YDoc;
  onReady?: () => void;
}

export const TiptapPreview: React.FC<Props> = (props) => {
  const { session } = useContext(SessionContext);

  const artifactMeta = getMetaFromYArtifact(props.yDoc);

  return (
    <ArtifactEditorContainer>
      <TiptapEditor
        artifactId={props.artifactId}
        editable={false}
        yDoc={props.yDoc}
        theme={artifactMeta.theme}
        getFileUrl={(fileId) => {
          if (!session) return '';
          return getFileRedirectUrl({
            fileId,
            sessionToken: session.token,
          }).toString();
        }}
      />
    </ArtifactEditorContainer>
  );
};
