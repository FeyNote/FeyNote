import { memo, useEffect, useState } from 'react';
import { ArtifactEditor } from '../editor/ArtifactEditor';
import { ArtifactCalendar } from '../calendar/ArtifactCalendar';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { trpc } from '../../utils/trpc';
import { useIonAlert } from '@ionic/react';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { getFileUrlById } from '../../utils/files/getFileUrlById';
import { ArtifactDraw } from '../draw/ArtifactDraw';
import { Edge, type SessionDTO } from '@feynote/shared-utils';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { appIdbStorageManager } from '../../utils/AppIdbStorageManager';
import { getEdgeStore } from '../../utils/localDb/edges/edgeStore';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';

interface Props {
  artifactId: string;
  onReady?: () => void;
}

export const ReadonlyArtifactViewer: React.FC<Props> = memo((props) => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const [edges, setEdges] = useState<{
    incomingEdges: Edge[];
    outgoingEdges: Edge[];
  }>();
  const [yDoc, setYDoc] = useState<YDoc>();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  // TODO: We need a way to get the session token without the blocking session context approach currently. As it stands here, null is "you don't have a session", while undefined is "session not loaded yet"
  const [session, setSession] = useState<SessionDTO | null | undefined>();
  useEffect(() => {
    appIdbStorageManager.getSession().then((session) => {
      setSession(session);
    });
  }, []);

  const { type } = useObserveYArtifactMeta(yDoc || new YDoc());

  const loadArtifactEdges = () => {
    trpc.artifact.getArtifactEdgesById
      .query({
        id: props.artifactId,
      })
      .then((result) => {
        setEdges(result);
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          401: () => {
            presentAlert({
              header: t('readonlyArtifactViewer.unauthorized.header'),
              message: t('readonlyArtifactViewer.unauthorized.message'),
              buttons: [
                {
                  text: t('generic.okay'),
                  handler: () => {
                    window.location.href = '/';
                  },
                },
              ],
            });
          },
          404: () => {
            presentAlert({
              header: t('readonlyArtifactViewer.notFound.header'),
              message: t('readonlyArtifactViewer.notFound.message'),
              buttons: [
                {
                  text: t('generic.okay'),
                  handler: () => {
                    window.location.href = '/';
                  },
                },
              ],
            });
          },
        });
      });
  };
  const loadArtifactYDoc = () => {
    trpc.artifact.getArtifactYBinById
      .query({
        id: props.artifactId,
      })
      .then((result) => {
        const yDoc = new YDoc();
        applyUpdate(yDoc, result.yBin);

        setYDoc(yDoc);
      })
      .catch((error) => {
        handleTRPCErrors(error, {
          401: () => {
            // We handle this in loadArtifactEdges
          },
          404: () => {
            // We handle this in loadArtifactEdges
          },
        });
      });
  };

  useEffect(() => {
    loadArtifactEdges();
    loadArtifactYDoc();
  }, [props.artifactId]);

  useEffect(() => {
    if (!edges) return;

    getEdgeStore().provideStaticEdgesForArtifactId({
      artifactId: props.artifactId,
      outgoingEdges: edges.outgoingEdges,
      incomingEdges: edges.incomingEdges,
    });
  }, [edges]);

  if (!edges || !yDoc || session === undefined) return;

  if (type === 'tiptap') {
    return (
      <ArtifactEditor
        artifactId={props.artifactId}
        editable={false}
        authorizedScope={CollaborationConnectionAuthorizedScope.ReadOnly}
        onReady={props.onReady}
        yjsProvider={undefined}
        yDoc={yDoc}
        getFileUrl={(fileId) => {
          return getFileUrlById(fileId, session || undefined);
        }}
      />
    );
  }

  if (type === 'calendar') {
    return (
      <ArtifactCalendar
        artifactId={props.artifactId}
        editable={false}
        onReady={props.onReady}
        y={yDoc}
        viewType="fullsize"
      />
    );
  }

  if (type === 'tldraw') {
    return (
      <ArtifactDraw
        artifactId={props.artifactId}
        editable={false}
        onReady={props.onReady}
        yDoc={yDoc}
        getFileUrl={(fileId) => {
          return getFileUrlById(fileId, session || undefined);
        }}
      />
    );
  }
});
