export const animateHighlightBlock = (
  blockId: string,
  containerRef: React.RefObject<HTMLElement | null> | Element | null,
) => {
  const container =
    containerRef && 'current' in containerRef
      ? containerRef.current
      : containerRef;

  if (!container) {
    console.warn(
      'animateHighlightBlock: container was not provided, cannot animate highlight',
    );
    return false;
  }

  const el = container.querySelector(
    `[id="${blockId}"],[data-id="${blockId}"],[data-toc-id="${blockId}"]`,
  );

  if (!el) return false;

  el.animate(
    [
      { backgroundColor: 'rgba(255, 255, 0, 0)' },
      { backgroundColor: 'rgba(255, 255, 0, 0.5)' },
      { backgroundColor: 'rgba(255, 255, 0, 0)' },
    ],
    {
      duration: 600,
      easing: 'ease-in-out',
      iterations: 2,
    },
  );

  return true;
};
