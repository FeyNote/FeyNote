export const animateHighlightBlock = (
  blockId: string,
  containerRef?: React.RefObject<HTMLElement | null>,
) => {
  const el = (containerRef?.current || document).querySelector(
    `[data-id="${blockId}"]`,
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
