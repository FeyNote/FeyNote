export const scrollBlockIntoView = (
  blockId: string,
  containerRef?: React.RefObject<HTMLElement | null>,
) => {
  const el = (containerRef?.current || document).querySelector(
    `[data-id="${blockId}"]`,
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
