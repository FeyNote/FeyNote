import { useEffect, useRef } from 'react';
import { specifierToDatestamp } from './specifierToDatestamp';

export const useScrollDateIntoView = (
  date: string | undefined,
  dependencies: any[],
  containerRef?: React.RefObject<HTMLElement>,
) => {
  const scrollExecutedRef = useRef(false);

  useEffect(() => {
    // We only want to execute the scroll once, so we don't repeatedly scroll the user
    if (scrollExecutedRef.current) return;
    // Focusing a blockId is optional
    if (!date) return;
    // The consumer wants us to scroll only within a specific container, but it's not ready yet
    if (containerRef && !containerRef.current) return;

    const datestamp = specifierToDatestamp(date);
    // We cannot focus invalid datestamps
    if (!datestamp) return;

    const el = (containerRef?.current || document).querySelector(
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
  }, [date, ...dependencies]);
};
