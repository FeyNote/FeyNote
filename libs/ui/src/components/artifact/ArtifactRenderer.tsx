import { memo, useContext, useEffect, useRef, useState } from 'react';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { SessionContext } from '../../context/session/SessionContext';
import { CollaborationManagerConnection } from '../../utils/collaboration/collaborationManager';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';
import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactDraw } from '../draw/ArtifactDraw';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { getFileUrlById } from '../../utils/files/getFileUrlById';
import { uploadFileToApi } from '../../utils/files/uploadFileToApi';
import type { TableOfContentData } from '@tiptap/extension-table-of-contents';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import styled from 'styled-components';
import { ArtifactDeletedBanner } from './ArtifactDeletedBanner';
import { ProgressBar } from '../info/ProgressBar';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

const ArtifactRendererContainer = styled.div`
  height: 100%;
`;

const FileUploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FileUploadOverlayContent = styled.div`
  color: white;
  padding: 10px;
  background: var(--ion-card-background);
  border-radius: 4px;
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.6);
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 300px;
  align-items: center;
  justify-items: center;
  gap: 8px;
`;

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  authorizedScope: CollaborationConnectionAuthorizedScope;
  scrollToBlockId?: string;
  scrollToDate?: string;
  onTitleChange?: (title: string) => void;
  onTocUpdate?: (content: TableOfContentData) => void;
  undelete?: () => void;
}

export const ArtifactRenderer: React.FC<Props> = memo((props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collabReady, setCollabReady] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const { session } = useContext(SessionContext);
  const [presentAlert] = useIonAlert();
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useScrollBlockIntoView(
    {
      blockId: props.scrollToBlockId,
      highlight: true,
      containerRef,
    },
    [editorReady],
  );
  useScrollDateIntoView(
    {
      date: props.scrollToDate,
      containerRef,
    },
    [editorReady],
  );

  const { type, deletedAt } = useObserveYArtifactMeta(props.connection.yjsDoc);

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

  if (!collabReady || !type) {
    return null;
  }

  const render = (renderer: React.ReactNode) => {
    return (
      <ArtifactRendererContainer ref={containerRef}>
        {deletedAt && (
          <ArtifactDeletedBanner
            undelete={props.undelete}
            deletedAt={deletedAt}
            authorizedScope={props.authorizedScope}
          />
        )}
        {renderer}
        {isUploadingFile && (
          <FileUploadOverlay>
            <FileUploadOverlayContent>
              {t('artifactRenderer.uploadingFile')}

              <ProgressBar progress={fileUploadProgress} />
            </FileUploadOverlayContent>
          </FileUploadOverlay>
        )}
      </ArtifactRendererContainer>
    );
  };

  const isEditable =
    !deletedAt &&
    (props.authorizedScope === CollaborationConnectionAuthorizedScope.CoOwner ||
      props.authorizedScope ===
        CollaborationConnectionAuthorizedScope.ReadWrite);

  if (type === 'tiptap') {
    return render(
      <ArtifactEditor
        showMenus={true}
        artifactId={props.artifactId}
        editable={isEditable}
        authorizedScope={props.authorizedScope}
        onReady={() => setEditorReady(true)}
        yjsProvider={props.connection.tiptapCollabProvider}
        yDoc={undefined}
        onTitleChange={props.onTitleChange}
        onTocUpdate={props.onTocUpdate}
        handleFileUpload={async (editor, files, pos) => {
          setIsUploadingFile(true);
          setFileUploadProgress(0);
          for (const file of files) {
            try {
              const response = await uploadFileToApi({
                file,
                purpose: 'artifact',
                artifactId: props.artifactId,
                onProgress: (progress) => {
                  setFileUploadProgress(progress);
                },
              });
              if (pos === undefined) {
                pos = editor.state.selection.anchor;
              }

              let type: string | null = null;
              if (response.mimetype === 'image/jpeg') {
                type = 'feynoteImage';
              } else if (
                response.mimetype === 'video/mp4' ||
                response.mimetype === 'video/webm' ||
                response.mimetype === 'video/mpeg'
              ) {
                type = 'feynoteVideo';
              } else if (response.mimetype === 'audio/mpeg') {
                type = 'feynoteAudio';
              } else {
                type = 'feynoteGenericFile';
              }

              if (!file.name || !response.id || !response.storageKey) {
                throw new Error('File incomplete/API response issue');
              }

              editor
                .chain()
                .insertContentAt(pos, {
                  type,
                  attrs: {
                    title: file.name,
                    alt: file.name,
                    fileId: response.id,
                    storageKey: response.storageKey,
                  },
                })
                .focus()
                .run();
            } catch (e) {
              handleTRPCErrors(e, {
                413: t('artifactRenderer.fileTooLarge'),
              });
            }
          }
          setIsUploadingFile(false);
        }}
        getFileUrl={(fileId) => {
          return getFileUrlById(fileId, session);
        }}
        showBottomSpacer={true}
      />,
    );
  }

  if (type === 'calendar') {
    return render(
      <ArtifactCalendar
        artifactId={props.artifactId}
        editable={isEditable}
        onReady={() => setEditorReady(true)}
        y={props.connection.tiptapCollabProvider}
        viewType="fullsize"
        centerDate={props.scrollToDate}
        onTitleChange={props.onTitleChange}
        showBottomSpacer={true}
      />,
    );
  }

  if (type === 'tldraw') {
    return render(
      <ArtifactDraw
        artifactId={props.artifactId}
        editable={isEditable}
        onReady={() => setEditorReady(true)}
        collaborationConnection={props.connection}
        onTitleChange={props.onTitleChange}
        handleFileUpload={async (file) => {
          setIsUploadingFile(true);
          setFileUploadProgress(0);
          const response = await uploadFileToApi({
            file,
            purpose: 'artifact',
            artifactId: props.artifactId,
            onProgress: (progress) => {
              setFileUploadProgress(progress);
            },
          })
            .catch((e) => {
              handleTRPCErrors(e, {
                413: t('artifactRenderer.fileTooLarge'),
              });
              throw e;
            })
            .finally(() => {
              setIsUploadingFile(false);
            });
          return response;
        }}
        getFileUrl={(fileId) => {
          return getFileUrlById(fileId, session);
        }}
      />,
    );
  }
});
