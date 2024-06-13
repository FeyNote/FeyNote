import { ArtifactDetail } from '@feynote/prisma/types';
import { useIonToast } from '@ionic/react';
import { handleTRPCErrors } from '../../../../../../utils/handleTRPCErrors';
import { useRef, useState } from 'react';
import { trpc } from '../../../../../../utils/trpc';

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
  const [artifact, setArtifact] = useState<ArtifactDetail>();
  const [showPreview, setShowPreview] = useState(false);

  const loadArtifact = async () => {
    if (isBroken) return;
    if (artifact) return;

    const _artifact = await trpc.artifact.getArtifactById
      .query({
        id: artifactId,
      })
      .catch((e) => {
        handleTRPCErrors(e, presentToast);
      });
    if (!_artifact) return;

    setArtifact(_artifact);
  };

  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const onMouseOver = () => {
    loadArtifact();
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(async () => {
      await loadArtifact();

      setShowPreview(true);
    }, OPEN_TIMEOUT);
  };

  const onMouseOut = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, CLOSE_TIMEOUT);
  };

  return {
    artifact,
    showPreview,
    onMouseOver,
    onMouseOut,
  };
};
