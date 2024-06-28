import { css } from 'styled-components';

export const placeholderExtensionStyles = css`
  p.is-editor-empty:first-child::before {
    color: var(--sheet-placeholder-color);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;
