export const scrollBlockIntoView = (
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
    el.scrollIntoView({
      behavior: 'instant',
      block: 'center',
      inline: 'center',
    });
    return true;
  }

  return false;
};
