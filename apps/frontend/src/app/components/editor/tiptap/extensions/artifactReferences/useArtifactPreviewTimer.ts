import { useContext, useRef, useState } from 'react';
import { YManagerContext } from '../../../../../context/yManager/YManagerContext';

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
  const { yManager } = useContext(YManagerContext);
  const artifactConnection = isBroken
    ? null
    : yManager.connectArtifact(artifactId);
  const [showPreview, setShowPreview] = useState(false);

  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const onMouseOver = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(async () => {
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
    artifactConnection,
    showPreview,
    onMouseOver,
    onMouseOut,
    close,
  };
};
