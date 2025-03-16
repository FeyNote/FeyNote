export const animateHighlightBlock = (
  blockId: string,
  containerRef: React.RefObject<HTMLElement | null> | Element | null,
) => {
  const element =
    containerRef && 'current' in containerRef
      ? containerRef.current
      : containerRef;
  const el = (element || document).querySelector(
    `[id="${blockId}"],[data-id="${blockId}"],[data-toc-id="${blockId}"]`,
  );

  if (el) {
    el.animate(
      [
        { backgroundColor: 'rgba(255, 255, 0, 0)' },
        { backgroundColor: 'rgba(255, 255, 0, 0.5)' },
        { backgroundColor: 'rgba(255, 255, 0, 0)' },
      ],
      {
        duration: 600,
        easing: 'ease-in-out',
        iterations: 3,
      },
    );
    return true;
  }

  return false;
};
