import { useHandleTRPCErrors } from '../../../../../utils/useHandleTRPCErrors';
import { useRef, useState } from 'react';
import { trpc } from '../../../../../utils/trpc';
import { ReferencePreviewInfo } from './ArtifactReferencePreview';

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
  const loadingPRef = useRef<Promise<unknown>>();
  const [artifactYBin, setArtifactYBin] = useState<Uint8Array>();
  const [artifactInaccessible, setArtifactInaccessible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const loadArtifactYBin = async () => {
    if (isBroken) return;
    if (artifactYBin) return;

    const _artifactYBin = await trpc.artifact.getArtifactYBinById
      .query({
        id: artifactId,
      })
      .catch((e) => {
        handleTRPCErrors(e, {
          401: () => {
            setArtifactInaccessible(true);
          },
          404: () => {
            setArtifactInaccessible(true);
          },
        });
      });
    if (!_artifactYBin) return;

    setArtifactYBin(_artifactYBin.yBin);
  };

  const load = async () => {
    if (loadingPRef.current) return loadingPRef.current;

    loadingPRef.current = loadArtifactYBin();
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

  const previewInfo = showPreview
    ? ({
        artifactYBin,
        artifactInaccessible,
        isBroken,
      } as ReferencePreviewInfo)
    : undefined;

  return {
    onMouseOver,
    onMouseOut,
    close,
    previewInfo,
  };
};
