import { css } from 'styled-components';

export const indentationExtensionStyles = css`
  [data-content-type='blockGroup'] {
    margin-left: 2px;
    padding-left: 22px;
    border-left: 1px solid var(--ion-background-color-step-300, lightgray);
    position: relative;
    min-height: 20px;

    > button.toggle {
      position: absolute;
      left: -2px;
      bottom: 0;
      width: 12px;
      top: 0;
      background: none;

      outline: none;
      user-select: none;
    }

    > span.placeholder {
      display: none;
      opacity: 0.5;
      user-select: none;
    }

    &.hidden {
      > div {
        display: none;
      }

      > span.placeholder {
        display: block;
      }
    }
  }
`;
