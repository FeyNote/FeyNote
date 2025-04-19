import { useEffect, useRef } from 'react';
import { animateHighlightBlock } from './animateHighlightBlock';

export const useScrollBlockIntoView = (
  args: {
    blockId: string | undefined;
    containerRef: React.RefObject<HTMLElement | null>;
    highlight?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we really do accept any!
  },
  dependencies: any[],
) => {
  const scrollExecutedRef = useRef(false);

  useEffect(() => {
    // We only want to execute the scroll once, so we don't repeatedly scroll the user
    if (scrollExecutedRef.current) return;
    // Focusing a blockId is optional (for a hook, calling conditionally is not possible)
    if (!args.blockId) return;
    // Container isn't ready yet
    if (!args.containerRef.current) return;

    // Wait for DOM flush
    setTimeout(() => {
      const el = (args.containerRef?.current || document).querySelector(
        `[data-id="${args.blockId}"]`,
      );
      if (el) {
        el.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'center',
        });
        // Wait for animation to take place
        setTimeout(() => {
          if (args.highlight && args.blockId) {
            animateHighlightBlock(args.blockId, args.containerRef || null);
          }
        }, 250);
        scrollExecutedRef.current = true;
      }
    });
  }, [
    args.blockId,
    args.containerRef?.current,
    args.highlight,
    ...dependencies,
  ]);
};
