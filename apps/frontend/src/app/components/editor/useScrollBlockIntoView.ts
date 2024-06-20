import { useEffect, useRef } from 'react';

export const useScrollBlockIntoView = (
  blockId: string | undefined,
  dependencies: any[],
) => {
  const scrollExecutedRef = useRef(false);

  useEffect(() => {
    // We only want to execute the scroll once, so we don't repeatedly scroll the user
    if (scrollExecutedRef.current) return;
    // Focusing a blockId is optional
    if (!blockId) return;

    const el = document.querySelector(`[data-id="${blockId}"]`);
    if (el) {
      el.scrollIntoView();
      scrollExecutedRef.current = true;
    }
  }, [blockId, ...dependencies]);
};
