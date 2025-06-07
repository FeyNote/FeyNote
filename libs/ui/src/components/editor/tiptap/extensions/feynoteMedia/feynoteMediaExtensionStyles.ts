import { css } from 'styled-components';

export const feynoteMediaExtensionStyles = css`
  .resizable-media-container {
    line-height: 0px;

    .resizable-media-resize-container {
      position: relative;
      display: inline-block;

      img {
        min-height: 60px;
        min-width: 60px;
        cursor: pointer;
      }

      .resizable-media-border {
        position: absolute;
        background-color: var(--ion-color-primary);
        cursor: pointer;
      }

      .resizable-media-handle {
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

    &.ProseMirror-selectednode {
      .resizable-media-resize-container:not(.edit-mode) {
        outline: 1px solid var(--ion-color-primary);
        outline-offset: -1px;
      }
    }
  }
`;
