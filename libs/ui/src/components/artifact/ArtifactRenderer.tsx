import { ArtifactDTO } from '@feynote/global-types';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { SessionContext } from '../../context/session/SessionContext';
import { KnownArtifactReference } from '../editor/tiptap/extensions/artifactReferences/KnownArtifactReference';
import { getKnownArtifactReferenceKey } from '../editor/tiptap/extensions/artifactReferences/getKnownArtifactReferenceKey';
import { ArtifactCollaborationManagerConnection } from '../editor/artifactCollaborationManager';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { incrementVersionForChangesOnArtifact } from '../../utils/incrementVersionForChangesOnArtifact';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';
import { getIsEditable } from '../../utils/getIsEditable';
import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactDraw } from '../draw/ArtifactDraw';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';

interface Props {
  artifact: ArtifactDTO;
  connection: ArtifactCollaborationManagerConnection;
  scrollToBlockId?: string;
  scrollToDate?: string;
  onTitleChange?: (title: string) => void;
}

export const ArtifactRenderer: React.FC<Props> = memo((props) => {
  const [collabReady, setCollabReady] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const { session } = useContext(SessionContext);
  const [presentAlert] = useIonAlert();
  const { t } = useTranslation();

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

  const { type } = useObserveYArtifactMeta(props.connection.yjsDoc);

  useEffect(() => {
    props.connection.syncedPromise
      .then(() => {
        setCollabReady(true);
      })
      .catch(() => {
        presentAlert({
          header: t('generic.error'),
          message: t('generic.connectionError'),
          buttons: [
            {
              text: t('generic.okay'),
              role: 'cancel',
            },
          ],
        });
      });
  }, [props.connection]);

  useEffect(() => {
    const cleanup = incrementVersionForChangesOnArtifact(
      props.artifact.id,
      props.connection.yjsDoc,
    );

    return () => cleanup();
  }, [props.connection]);

  // Purely for visual purposes. Permissioning occurs on the server, but we need to update the editor UI to be read/write
  const isEditable = useMemo(
    () => getIsEditable(props.artifact, session.userId),
    [props.artifact, session.userId],
  );

  if (!collabReady || !type) {
    return <></>;
  }

  if (type === 'tiptap') {
    return (
      <ArtifactEditor
        editable={isEditable}
        knownReferences={knownReferences}
        onReady={() => setEditorReady(true)}
        yjsProvider={props.connection.tiptapCollabProvider}
        yDoc={undefined}
        onTitleChange={props.onTitleChange}
      />
    );
  }

  if (type === 'calendar') {
    return (
      <ArtifactCalendar
        editable={isEditable}
        knownReferences={knownReferences}
        onReady={() => setEditorReady(true)}
        y={props.connection.tiptapCollabProvider}
        viewType="fullsize"
        centerDate={props.scrollToDate}
        incomingArtifactReferences={props.artifact.incomingArtifactReferences}
        onTitleChange={props.onTitleChange}
      />
    );
  }

  if (type === 'tldraw') {
    return (
      <ArtifactDraw
        editable={isEditable}
        knownReferences={knownReferences}
        onReady={() => setEditorReady(true)}
        y={props.connection.tiptapCollabProvider}
        incomingArtifactReferences={props.artifact.incomingArtifactReferences}
        onTitleChange={props.onTitleChange}
      />
    );
  }
});
