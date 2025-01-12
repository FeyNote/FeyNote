import { memo, useEffect, useState } from 'react';
import { ArtifactEditor } from '../../editor/ArtifactEditor';
import { ArtifactCalendar } from '../../calendar/ArtifactCalendar';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { trpc } from '../../../utils/trpc';
import { useIonAlert } from '@ionic/react';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';
import { useTranslation } from 'react-i18next';
import { getFileRedirectUrl } from '../../../utils/files/getFileRedirectUrl';
import { ArtifactDraw } from '../../draw/ArtifactDraw';
import { Edge } from '@feynote/shared-utils';
import { getEdgeStore } from '../../../utils/edgesReferences/edgeStore';
import { useObserveYArtifactMeta } from '../../../utils/useObserveYArtifactMeta';

interface Props {
  artifactId: string;
  shareToken?: string;
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

  const { type } = useObserveYArtifactMeta(yDoc || new YDoc());

  const loadArtifactEdges = () => {
    trpc.artifact.getArtifactEdgesById
      .query({
        id: props.artifactId,
        shareToken: props.shareToken,
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
        shareToken: props.shareToken,
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
  }, [props.artifactId, props.shareToken]);

  useEffect(() => {
    if (!edges) return;

    getEdgeStore().provideStaticEdgesForArtifactId({
      artifactId: props.artifactId,
      outgoingEdges: edges.outgoingEdges,
      incomingEdges: edges.incomingEdges,
    });
  }, [edges]);

  if (!edges || !yDoc) return;

  if (type === 'tiptap') {
    return (
      <ArtifactEditor
        artifactId={props.artifactId}
        editable={false}
        yjsProvider={undefined}
        yDoc={yDoc}
        getFileUrl={(fileId) => {
          return getFileRedirectUrl({
            fileId,
            shareToken: props.shareToken,
          }).toString();
        }}
      />
    );
  }

  if (type === 'calendar') {
    return (
      <ArtifactCalendar
        artifactId={props.artifactId}
        editable={false}
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
        yDoc={yDoc}
        getFileUrl={(fileId) => {
          return getFileRedirectUrl({
            fileId,
            shareToken: props.shareToken,
          }).toString();
        }}
      />
    );
  }
});
