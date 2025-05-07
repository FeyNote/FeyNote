import { memo, useContext, useEffect, useRef, useState } from 'react';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { SessionContext } from '../../context/session/SessionContext';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { useScrollBlockIntoView } from '../editor/useScrollBlockIntoView';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { useScrollDateIntoView } from '../calendar/useScrollDateIntoView';
import { useIonAlert } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { ArtifactDraw } from '../draw/ArtifactDraw';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { getFileRedirectUrl } from '../../utils/files/getFileRedirectUrl';
import { uploadFileToApi } from '../../utils/files/uploadFileToApi';
import type { TableOfContentData } from '@tiptap-pro/extension-table-of-contents';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import styled from 'styled-components';
import { ArtifactDeletedBanner } from './ArtifactDeletedBanner';

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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-top-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  isEditable: boolean;
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
      <div ref={containerRef}>
        {deletedAt && (
          <ArtifactDeletedBanner
            undelete={props.undelete}
            deletedAt={deletedAt}
            isEditable={props.isEditable}
          />
        )}
        {renderer}
        {isUploadingFile && (
          <FileUploadOverlay>
            <FileUploadOverlayContent>
              <Spinner />
              {t('artifactRenderer.uploadingFile')}
            </FileUploadOverlayContent>
          </FileUploadOverlay>
        )}
      </div>
    );
  };

  if (type === 'tiptap') {
    return render(
      <ArtifactEditor
        artifactId={props.artifactId}
        editable={props.isEditable && !deletedAt}
        onReady={() => setEditorReady(true)}
        yjsProvider={props.connection.tiptapCollabProvider}
        yDoc={undefined}
        onTitleChange={props.onTitleChange}
        onTocUpdate={props.onTocUpdate}
        handleFileUpload={async (editor, files, pos) => {
          setIsUploadingFile(true);
          for (const file of files) {
            try {
              console.log("files", file);
              const response = await uploadFileToApi({
                file,
                purpose: 'artifact',
                artifactId: props.artifactId,
              });
              if (pos === undefined) {
                pos = editor.state.selection.anchor;
              }
              let type: string | null = null;
              if (file.type.startsWith('image/')) {
                type = 'feynoteImage';
              }
              if (file.type.startsWith('video/')) {
                type = 'feynoteVideo';
              }
              if (file.type.startsWith('audio/')) {
                type = 'feynoteAudio';
              }
              if (!type) {
                presentAlert({
                  header: t('artifactRenderer.unsupportedFileType'),
                  message: t('artifactRenderer.unsupportedFileType.message'),
                  buttons: [
                    {
                      text: t('generic.okay'),
                      role: 'cancel',
                    },
                  ],
                });
                continue;
              }
              console.log("asdf", type, response);
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
          return getFileRedirectUrl({
            fileId,
            sessionToken: session.token,
          }).toString();
        }}
        showBottomSpacer={true}
      />,
    );
  }

  if (type === 'calendar') {
    return render(
      <ArtifactCalendar
        artifactId={props.artifactId}
        editable={props.isEditable && !deletedAt}
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
        editable={props.isEditable && !deletedAt}
        onReady={() => setEditorReady(true)}
        collaborationConnection={props.connection}
        onTitleChange={props.onTitleChange}
        handleFileUpload={async (file) => {
          setIsUploadingFile(true);
          const response = await uploadFileToApi({
            file,
            purpose: 'artifact',
            artifactId: props.artifactId,
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
          return getFileRedirectUrl({
            fileId,
            sessionToken: session.token,
          }).toString();
        }}
      />,
    );
  }
});
