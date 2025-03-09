import { css } from 'styled-components';

export const feynoteImageExtensionStyles = css`
  .resizable-image-container {
    position: relative;
    display: inline-block;
    line-height: 0px;

    img {
      cursor: default;
    }

    .resizable-image-border {
      position: absolute;
      background-color: var(--ion-color-primary);
      cursor: pointer;
    }

    .resizable-image-handle {
      position: absolute;
      background-color: var(--ion-color-primary);
      height: 10px;
      width: 10px;
      border-radius: 50%;

      &.top-left {
        top: -5px;
        left: -5px;
        cursor: nwse-resize;
      }

      &.top-right {
        top: -5px;
        right: -5px;
        cursor: nesw-resize;
      }

      &.bottom-left {
        bottom: -5px;
        left: -5px;
        cursor: nesw-resize;
      }

      &.bottom-right {
        bottom: -5px;
        right: -5px;
        cursor: nwse-resize;
      }
    }
  }
`;
