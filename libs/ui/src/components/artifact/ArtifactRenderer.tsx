import { memo, useContext, useEffect, useState } from 'react';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { SessionContext } from '../../context/session/SessionContext';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { incrementVersionForChangesOnArtifact } from '../../utils/incrementVersionForChangesOnArtifact';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';
import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactDraw } from '../draw/ArtifactDraw';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { getFileRedirectUrl } from '../../utils/files/getFileRedirectUrl';
import { uploadFileToApi } from '../../utils/files/uploadFileToApi';
import { useIsEditable } from '../../utils/useAuthorizedScope';

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  scrollToBlockId?: string;
  scrollToDate?: string;
  onTitleChange?: (title: string) => void;
}

export const ArtifactRenderer: React.FC<Props> = memo((props) => {
  const { isEditable } = useIsEditable(props.connection);
  const [collabReady, setCollabReady] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const { session } = useContext(SessionContext);
  const [presentAlert] = useIonAlert();
  const { t } = useTranslation();

  useScrollBlockIntoView(props.scrollToBlockId, [editorReady], undefined, true);
  useScrollDateIntoView(props.scrollToDate, [editorReady]);

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
      props.artifactId,
      props.connection.yjsDoc,
    );

    return () => cleanup();
  }, [props.connection]);

  if (!collabReady || !type) {
    return null;
  }

  if (type === 'tiptap') {
    return (
      <ArtifactEditor
        artifactId={props.artifactId}
        editable={isEditable}
        onReady={() => setEditorReady(true)}
        yjsProvider={props.connection.tiptapCollabProvider}
        yDoc={undefined}
        onTitleChange={props.onTitleChange}
        handleFileUpload={async (editor, files, pos) => {
          for (const file of files) {
            const response = await uploadFileToApi({
              file,
              purpose: 'artifact',
              artifactId: props.artifactId,
              sessionToken: session.token,
            });
            if (pos === undefined) {
              pos = editor.state.selection.anchor;
            }
            editor
              .chain()
              .insertContentAt(pos, {
                type: 'feynoteImage',
                attrs: {
                  title: file.name,
                  alt: file.name,
                  fileId: response.id,
                  storageKey: response.storageKey,
                },
              })
              .focus()
              .run();
          }
        }}
        getFileUrl={(fileId) => {
          return getFileRedirectUrl({
            fileId,
            sessionToken: session.token,
          }).toString();
        }}
      />
    );
  }

  if (type === 'calendar') {
    return (
      <ArtifactCalendar
        artifactId={props.artifactId}
        editable={isEditable}
        onReady={() => setEditorReady(true)}
        y={props.connection.tiptapCollabProvider}
        viewType="fullsize"
        centerDate={props.scrollToDate}
        onTitleChange={props.onTitleChange}
      />
    );
  }

  if (type === 'tldraw') {
    return (
      <ArtifactDraw
        artifactId={props.artifactId}
        editable={isEditable}
        onReady={() => setEditorReady(true)}
        collaborationConnection={props.connection}
        onTitleChange={props.onTitleChange}
        handleFileUpload={async (file) => {
          const response = await uploadFileToApi({
            file,
            purpose: 'artifact',
            artifactId: props.artifactId,
            sessionToken: session.token,
          });
          return response;
        }}
        getFileUrl={(fileId) => {
          return getFileRedirectUrl({
            fileId,
            sessionToken: session.token,
          }).toString();
        }}
      />
    );
  }
});
