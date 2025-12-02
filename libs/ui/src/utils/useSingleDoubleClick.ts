import { useRef, useCallback } from 'react';

/**
 * This provides an easy way to consume React's "onClick" and "onDoubleClick"
 * WARN: Keep in mind that this will add a noticable delay to single-click operations, so it's generally preferred to use onFirstClick instead of onSingleClick *if you can*.
 * Keep in mind that onFirstClick will still fire in the case of a double click, but does only fire _once_ (rather than onClick which fires twice).
 *
 * Why does this need to exist? The problem with React's "onClick" and "onDoubleClick" is a double click still fires two "onClick" events
 *
 */
export function useSingleDoubleClick(
  onSingleClick?: (event: React.MouseEvent) => void,
  onDoubleClick?: (event: React.MouseEvent) => void,
  onFirstClick?: (event: React.MouseEvent) => void,
  delay = 200,
) {
  const clickTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isWaitingForDoubleClick = useRef(false);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      clearTimeout(clickTimeout.current);

      // Only fire onFirstClickImmediate on the actual first click, not the second click of a double-click
      if (!isWaitingForDoubleClick.current) {
        onFirstClick?.(event);
        isWaitingForDoubleClick.current = true;
      }

      // Wait to see if a double-click happens
      clickTimeout.current = setTimeout(() => {
        onSingleClick?.(event);
        isWaitingForDoubleClick.current = false;
      }, delay);
    },
    [onSingleClick, delay],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      clearTimeout(clickTimeout.current);
      isWaitingForDoubleClick.current = false;
      onDoubleClick?.(event);
    },
    [onDoubleClick],
  );

  return {
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
  };
}
