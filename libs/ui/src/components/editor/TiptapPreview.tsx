import { ArtifactEditorContainer } from './ArtifactEditorContainer';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { useSessionContext } from '../../context/session/SessionContext';
import { getFileUrlById } from '../../utils/files/getFileUrlById';
import { TiptapEditor } from './TiptapEditor';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

interface Props {
  artifactId: string;
  yDoc: YDoc;
  onReady?: () => void;
}

export const TiptapPreview: React.FC<Props> = (props) => {
  const sessionContext = useSessionContext(true);

  const artifactMeta = getMetaFromYArtifact(props.yDoc);

  return (
    <ArtifactEditorContainer>
      <TiptapEditor
        artifactId={props.artifactId}
        editable={false}
        authorizedScope={CollaborationConnectionAuthorizedScope.ReadOnly}
        yDoc={props.yDoc}
        theme={artifactMeta.theme}
        getFileUrl={async (fileId) => {
          return getFileUrlById(fileId, sessionContext?.session);
        }}
      />
    </ArtifactEditorContainer>
  );
};
