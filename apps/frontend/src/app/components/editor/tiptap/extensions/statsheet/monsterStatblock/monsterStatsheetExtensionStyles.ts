import { css } from 'styled-components';
import { statsheetExtensionStyles } from '../statsheetExtensionStyles';

export const monsterStatsheetExtensionStyles = css`
  [data-monster-statblock] {
    ${statsheetExtensionStyles}

    &[data-wide="true"] {
      width: min(750px, 100%);

      column-count: 2;
      column-fill: balance;
      column-gap: 34px;
      column-width: 290px;
    }

    font-family: ScalySansRemake;

    .tableWrapper:first-of-type table {
      width: auto !important;
      min-width: 325px !important;

      th,
      td {
        text-align: center;

        p {
          margin-top: 0;
          margin-bottom: 0;
        }
      }
    }
  }
`;
