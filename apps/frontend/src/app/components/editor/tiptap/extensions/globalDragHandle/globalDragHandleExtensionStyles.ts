import { css } from 'styled-components';

export const globalDragHandleExtensionStyles = css`
  #tiptap-global-drag-handle-container {
    left: 48px !important;

    width: 20px;
    height: 20px;
    position: fixed;
    transform: translateX(-15px);

    transition: opacity 70ms;

    &.hide {
      opacity: 0;
    }
  }
`;
