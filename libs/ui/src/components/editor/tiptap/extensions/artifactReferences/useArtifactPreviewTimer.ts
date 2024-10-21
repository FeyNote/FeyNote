import { ArtifactDTO } from '@feynote/global-types';
import { useIonToast } from '@ionic/react';
import { handleTRPCErrors } from '../../../../../utils/handleTRPCErrors';
import { useRef, useState } from 'react';
import { trpc } from '../../../../../utils/trpc';

/**
 * Milliseconds the user has to hover in order for reference preview to open
 */
const OPEN_TIMEOUT = 500;

/**
 * Milliseconds of buffer time we give the user after moving their mouse out before
 * closing the dialogue, for instance if they miss slightly as they move their mouse down
 * into the dialogue.
 */
const CLOSE_TIMEOUT = 200;

export const useArtifactPreviewTimer = (
  artifactId: string,
  isBroken: boolean,
) => {
  const [presentToast] = useIonToast();
  const loadingPRef = useRef<Promise<unknown>>();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const [artifactYBin, setArtifactYBin] = useState<Uint8Array>();
  const [showPreview, setShowPreview] = useState(false);

  const loadArtifact = async () => {
    if (isBroken) return;
    if (artifact) return;

    const _artifact = await trpc.artifact.getArtifactById
      .query({
        id: artifactId,
      })
      .catch((e) => {
        handleTRPCErrors(e, presentToast, {
          401: () => {
            // Do nothing
          },
          404: () => {
            // Do nothing
          },
        });
      });
    if (!_artifact) return;

    setArtifact(_artifact);
  };

  const loadArtifactYBin = async () => {
    if (isBroken) return;
    if (artifactYBin) return;

    const _artifactYBin = await trpc.artifact.getArtifactYBinById
      .query({
        id: artifactId,
      })
      .catch((e) => {
        handleTRPCErrors(e, presentToast, {
          401: () => {
            // Do nothing
          },
          404: () => {
            // Do nothing
          },
        });
      });
    if (!_artifactYBin) return;

    setArtifactYBin(_artifactYBin.yBin);
  };

  const load = async () => {
    if (loadingPRef.current) return loadingPRef.current;

    loadingPRef.current = Promise.all([loadArtifact(), loadArtifactYBin()]);
  };

  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const onMouseOver = () => {
    load();
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(async () => {
      await load();

      setShowPreview(true);
    }, OPEN_TIMEOUT);
  };

  const onMouseOut = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, CLOSE_TIMEOUT);
  };

  const close = () => {
    clearTimeout(hoverTimeoutRef.current);
    setShowPreview(false);
  };

  return {
    artifact,
    artifactYBin,
    showPreview,
    onMouseOver,
    onMouseOut,
    close,
  };
};
