import { ArtifactDTO } from '@feynote/prisma/types';
import { memo, useEffect, useState } from 'react';
import { ArtifactEditor } from '../../editor/ArtifactEditor';
import { ArtifactCalendar } from '../../calendar/ArtifactCalendar';
import { applyUpdate, Doc as YDoc } from 'yjs';
import { trpc } from '../../../utils/trpc';
import { useIonAlert, useIonToast } from '@ionic/react';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useTranslation } from 'react-i18next';

interface Props {
  artifactId: string;
  shareToken?: string;
}

export const ReadonlyArtifactViewer: React.FC<Props> = memo((props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const [yDoc, setYDoc] = useState<YDoc>();

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
        handleTRPCErrors(error, presentToast, {
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
        handleTRPCErrors(error, presentToast, {
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
});
