import { useEffect, useRef } from 'react';

export const useScrollBlockIntoView = (
  blockId: string | undefined,
  dependencies: any[],
  containerRef?: React.RefObject<HTMLElement>,
) => {
  const scrollExecutedRef = useRef(false);

  useEffect(() => {
    // We only want to execute the scroll once, so we don't repeatedly scroll the user
    if (scrollExecutedRef.current) return;
    // Focusing a blockId is optional
    if (!blockId) return;

    const el = (containerRef?.current || document).querySelector(
      `[data-id="${blockId}"]`,
    );
    if (el) {
      el.scrollIntoView({
        behavior: 'instant',
        block: 'center',
        inline: 'center',
      });
      scrollExecutedRef.current = true;
    }
  }, [blockId, ...dependencies]);
};
