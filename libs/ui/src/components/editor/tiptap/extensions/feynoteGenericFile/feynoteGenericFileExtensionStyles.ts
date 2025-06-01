import { css } from 'styled-components';

export const feynoteGenericFileExtensionStyles = css`
  a.generic-file-container {
    display: grid;
    grid-template-columns: 1fr minmax(100px, min-content) 1fr;
    padding: 8px;
    border: 1px solid var(--ion-background-color-step-200);
    border-radius: 5px;

    color: var(--ion-text-color);
    cursor: pointer;
    text-decoration: none;
    text-wrap: nowrap;
    white-space: nowrap;

    overflow: hidden;
    text-overflow: ellipsis;

    max-width: min(100%, 400px);
    width: fit-content;

    &.ProseMirror-selectednode {
      outline: 1px solid var(--ion-color-primary);
      outline-offset: -1px;
    }

    .file-icon {
      display: flex;
      align-items: center;
      margin-right: 8px;

      svg {
        fill: var(--ion-text-color);
        height: 1rem;
      }
    }

    .text {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .download-icon {
      display: flex;
      align-items: center;
      margin-left: 8px;

      svg {
        fill: var(--ion-color-primary);
        height: 1rem;
      }
    }
  }
`;
