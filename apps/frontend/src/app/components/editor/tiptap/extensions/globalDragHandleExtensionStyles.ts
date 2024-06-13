import { css } from 'styled-components';

export const globalDragHandleExtensionStyles = css`
  .drag-handle {
    width: 20px;
    height: 20px;
    background: purple;
    position: fixed;
    transform: translateX(-15px);

    transition:
      opacity 70ms,
      top 100ms;

    &.hide {
      opacity: 0;
    }
  }
`;
