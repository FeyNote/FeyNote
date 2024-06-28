const MIN_WIDTH_FOR_SPLIT_PANE = 800;

export const isLargeEnoughForSplitPane = () => {
  return window.innerWidth >= MIN_WIDTH_FOR_SPLIT_PANE;
};
