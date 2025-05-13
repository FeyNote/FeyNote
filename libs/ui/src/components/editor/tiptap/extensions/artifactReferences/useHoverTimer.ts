import { useRef, useState } from 'react';

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

export const useHoverTimer = (onFirstInteraction?: () => Promise<void>) => {
  const firstInteractionPromiseRef = useRef<Promise<unknown>>(undefined);
  const [show, setShow] = useState(false);

  const firstInteraction = () => {
    if (firstInteractionPromiseRef.current)
      return firstInteractionPromiseRef.current;

    firstInteractionPromiseRef.current = onFirstInteraction?.();

    return firstInteractionPromiseRef.current;
  };

  const hoverTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const onMouseOver = () => {
    firstInteraction();
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(async () => {
      await firstInteraction();

      setShow(true);
    }, OPEN_TIMEOUT);
  };

  const onMouseOut = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShow(false);
    }, CLOSE_TIMEOUT);
  };

  const close = () => {
    clearTimeout(hoverTimeoutRef.current);
    setShow(false);
  };

  return {
    onMouseOver,
    onMouseOut,
    close,
    show,
  };
};
