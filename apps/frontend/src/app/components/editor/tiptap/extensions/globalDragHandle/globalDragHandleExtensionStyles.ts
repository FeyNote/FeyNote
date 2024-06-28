import { css } from 'styled-components';

export const globalDragHandleExtensionStyles = css`
  #tiptap-global-drag-handle-container {
    display: flex;

    left: 48px !important;

    position: fixed;
    transform: translateX(-15px);

    transition: opacity 70ms;

    &.hide {
      opacity: 0;
    }

    #tiptap-global-drag-handle {
      height: 18px;
      width: 18px;
    }
  }
`;
