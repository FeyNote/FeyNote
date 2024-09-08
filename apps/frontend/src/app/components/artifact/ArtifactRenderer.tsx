import { ArtifactDTO } from '@feynote/prisma/types';
import { memo, useContext, useEffect, useState } from 'react';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { SessionContext } from '../../context/session/SessionContext';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { getKnownArtifactReferenceKey } from '../editor/tiptap/extensions/artifactReferences/getKnownArtifactReferenceKey';
import { artifactCollaborationManager } from '../editor/artifactCollaborationManager';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { incrementVersionForChangesOnArtifact } from '../../../utils/incrementVersionForChangesOnArtifact';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';

interface Props {
  artifact: ArtifactDTO;
  scrollToBlockId?: string;
  scrollToDate?: string;
  onTitleChange?: (title: string) => void;
}

export const ArtifactRenderer: React.FC<Props> = memo((props) => {
  const [editorReady, setEditorReady] = useState(false);
  const { session } = useContext(SessionContext);

  useScrollBlockIntoView(props.scrollToBlockId, [editorReady]);
  useScrollDateIntoView(props.scrollToDate, [editorReady]);

  // We must preserve the original map between renders
  // because tiptap exists outside of React's render cycle
  const [knownReferences] = useState(new Map<string, KnownArtifactReference>());
  useEffect(() => {
    for (const reference of props.artifact.artifactReferences) {
      const key = getKnownArtifactReferenceKey(
        reference.targetArtifactId,
        reference.targetArtifactBlockId || undefined,
        reference.targetArtifactDate || undefined,
      );

      knownReferences.set(key, {
        artifactBlockId: reference.artifactBlockId,
        targetArtifactId: reference.targetArtifactId,
        targetArtifactBlockId: reference.targetArtifactBlockId || undefined,
        targetArtifactDate: reference.targetArtifactDate || undefined,
        referenceText: reference.referenceText,
        isBroken: !reference.referenceTargetArtifactId,
      });
    }
  }, [props.artifact.artifactReferences]);

  const connection = artifactCollaborationManager.get(
    props.artifact.id,
    session,
  );

  useEffect(() => {
    const cleanup = incrementVersionForChangesOnArtifact(
      props.artifact.id,
      connection.yjsDoc,
    );

    return () => cleanup();
  }, [connection]);

  // Purely for visual purposes. Permissioning occurs on the server, but we need to update the editor UI to be read/write
  const isEditable =
    props.artifact.userId === session.userId ||
    props.artifact.artifactShares.some(
      (share) =>
        share.userId === session.userId && share.accessLevel === 'readwrite',
    );

  if (props.artifact.type === 'tiptap') {
    return (
      <ArtifactEditor
        editable={isEditable}
        knownReferences={knownReferences}
        onReady={() => setEditorReady(true)}
        yjsProvider={connection.tiptapCollabProvider}
        yDoc={undefined}
        onTitleChange={props.onTitleChange}
      />
    );
  }

  if (props.artifact.type === 'calendar') {
    return (
      <ArtifactCalendar
        editable={isEditable}
        knownReferences={knownReferences}
        onReady={() => setEditorReady(true)}
        y={connection.tiptapCollabProvider}
        viewType="fullsize"
        centerDate={props.scrollToDate}
        incomingArtifactReferences={props.artifact.incomingArtifactReferences}
        onTitleChange={props.onTitleChange}
      />
    );
  }
});
