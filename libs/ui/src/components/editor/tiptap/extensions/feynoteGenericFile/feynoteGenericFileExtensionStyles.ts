import { css } from 'styled-components';

export const feynoteGenericFileExtensionStyles = css`
  a.generic-file-container {
    display: block;
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
    width: min-content;

    &.ProseMirror-selectednode {
      outline: 1px solid var(--ion-color-primary);
      outline-offset: -1px;
    }
  }
`;
