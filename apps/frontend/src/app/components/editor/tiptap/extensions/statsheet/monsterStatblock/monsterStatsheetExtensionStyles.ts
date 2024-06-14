import { css } from 'styled-components';
import { statsheetExtensionStyles } from '../statsheetExtensionStyles';

export const monsterStatsheetExtensionStyles = css`
  [data-monster-statblock] {
    ${statsheetExtensionStyles}

    font-family: ScalySansRemake;

    .tableWrapper:first-of-type table {
      width: auto !important;
      min-width: 325px !important;

      th,
      td {
        text-align: center;
      }
    }
  }
`;
