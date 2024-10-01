import { css } from 'styled-components';

export const indentationExtensionStyles = css`
  --blockIndentDepth: 30px;
  [data-depth='1'] {
    margin-left: calc(var(--blockIndentDepth) * 1);
  }
  [data-depth='2'] {
    margin-left: calc(var(--blockIndentDepth) * 2);
  }
  [data-depth='3'] {
    margin-left: calc(var(--blockIndentDepth) * 3);
  }
  [data-depth='4'] {
    margin-left: calc(var(--blockIndentDepth) * 4);
  }
  [data-depth='5'] {
    margin-left: calc(var(--blockIndentDepth) * 5);
  }
  [data-depth='6'] {
    margin-left: calc(var(--blockIndentDepth) * 6);
  }
  [data-depth='7'] {
    margin-left: calc(var(--blockIndentDepth) * 7);
  }
  [data-depth='8'] {
    margin-left: calc(var(--blockIndentDepth) * 8);
  }
  [data-depth='9'] {
    margin-left: calc(var(--blockIndentDepth) * 9);
  }
  [data-depth='10'] {
    margin-left: calc(var(--blockIndentDepth) * 10);
  }
  [data-depth='11'] {
    margin-left: calc(var(--blockIndentDepth) * 11);
  }
  [data-depth='12'] {
    margin-left: calc(var(--blockIndentDepth) * 12);
  }
  [data-depth='13'] {
    margin-left: calc(var(--blockIndentDepth) * 13);
  }
  [data-depth='14'] {
    margin-left: calc(var(--blockIndentDepth) * 14);
  }
  [data-depth='15'] {
    margin-left: calc(var(--blockIndentDepth) * 15);
  }

  [data-content-type='blockGroup'] {
    margin-left: calc(var(--blockIndentDepth) / 3);
    padding-left: calc(var(--blockIndentDepth) / 2);
    border-left: 1px solid lightgray;
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
