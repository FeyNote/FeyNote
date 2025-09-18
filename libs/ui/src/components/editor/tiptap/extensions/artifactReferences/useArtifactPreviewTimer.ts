import { useHandleTRPCErrors } from '../../../../../utils/useHandleTRPCErrors';
import { useState } from 'react';
import { trpc } from '../../../../../utils/trpc';
import { ReferencePreviewInfo } from './ArtifactReferencePreview';
import { useHoverTimer } from './useHoverTimer';

export const useArtifactPreviewTimer = (artifactId: string) => {
  const [artifactYBin, setArtifactYBin] = useState<Uint8Array>();
  const [artifactInaccessible, setArtifactInaccessible] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const loadArtifactYBin = async () => {
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

  const { onMouseOver, onMouseOut, close, show } =
    useHoverTimer(loadArtifactYBin);

  const previewInfo = show
    ? ({
        artifactYBin,
        artifactInaccessible,
      } as ReferencePreviewInfo)
    : undefined;

  return {
    onMouseOver,
    onMouseOut,
    close,
    previewInfo,
  };
};
