import { useEffect, useRef } from 'react';
import { specifierToDatestamp } from './specifierToDatestamp';

export const useScrollDateIntoView = (
  args: {
    date: string | undefined;
    containerRef: React.RefObject<HTMLElement | null>;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we really do allow any!
  dependencies: any[],
) => {
  const scrollExecutedRef = useRef(false);

  useEffect(() => {
    // We only want to execute the scroll once, so we don't repeatedly scroll the user
    if (scrollExecutedRef.current) return;
    // Focusing a blockId is optional (for a hook, calling conditionally is not possible)
    if (!args.date) return;
    // Container isn't ready yet
    if (!args.containerRef.current) return;

    const datestamp = specifierToDatestamp(args.date);
    // We cannot focus invalid datestamps
    if (!datestamp) return;

    const el = args.containerRef.current.querySelector(
      `[data-date="${datestamp}"]`,
    );
    if (el) {
      el.scrollIntoView({
        behavior: 'instant',
        block: 'center',
        inline: 'center',
      });
      scrollExecutedRef.current = true;
    }
  }, [args.date, args.containerRef.current, ...dependencies]);
};
