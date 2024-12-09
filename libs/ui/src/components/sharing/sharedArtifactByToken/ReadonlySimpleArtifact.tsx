import { ArtifactDTO } from '@feynote/global-types';
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

interface Props {
  artifactId: string;
  shareToken?: string;
}

export const ReadonlyArtifactViewer: React.FC<Props> = memo((props) => {
  const { t } = useTranslation();
  const [presentAlert] = useIonAlert();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const [yDoc, setYDoc] = useState<YDoc>();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const loadArtifact = () => {
    trpc.artifact.getArtifactById
      .query({
        id: props.artifactId,
        shareToken: props.shareToken,
      })
      .then((result) => {
        setArtifact(result);
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
            // We handle this in loadArtifact
          },
          404: () => {
            // We handle this in loadArtifact
          },
        });
      });
  };

  useEffect(() => {
    loadArtifact();
    loadArtifactYDoc();
  }, [props.artifactId, props.shareToken]);

  if (!artifact || !yDoc) return;

  if (artifact.type === 'tiptap') {
    return (
      <ArtifactEditor
        editable={false}
        knownReferences={new Map()}
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

  if (artifact.type === 'calendar') {
    return (
      <ArtifactCalendar
        editable={false}
        knownReferences={new Map()}
        y={yDoc}
        viewType="fullsize"
        incomingArtifactReferences={artifact.incomingArtifactReferences}
      />
    );
  }

  if (artifact.type === 'tldraw') {
    return (
      <ArtifactDraw
        editable={false}
        knownReferences={new Map()}
        yDoc={yDoc}
        incomingArtifactReferences={artifact.incomingArtifactReferences}
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
