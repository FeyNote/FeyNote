import { css } from 'styled-components';

export const statsheetActionButtonStyles = css`
  .statsheet-action-buttons {
    display: flex;
    position: absolute;
    top: -30px;
    right: -5px;
    flex-direction: row;
    gap: 8px;

    background: var(--contrasting-element-background);
    box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
    padding: 2px 3px;
    border-radius: 4px;

    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.1s,
      visibility 0.2s;
    transition-delay: 0.1s;

    .statsheet-action-button {
      width: 24px;
      height: 24px;
      background: none;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px;
      border-radius: 4px;

      &:hover {
        background: var(--general-background);
      }

      i {
        width: 100%;
        height: 100%;

        stroke: black;
        stroke-width: 10px;
        stroke-dasharray: 2, 2;
        stroke-linejoin: round;
        fill: var(--text-color);
      }
    }
  }

  &.has-focus .statsheet-action-buttons {
    visibility: visible;
    opacity: 1;
  }
`;
