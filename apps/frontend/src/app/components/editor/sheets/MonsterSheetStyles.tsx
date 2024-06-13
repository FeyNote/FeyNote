import styled from 'styled-components';
import { BaseSheet } from './BaseSheet';

export const MonsterSheetStyles = styled(BaseSheet)`
  .tiptap {
    * {
      font-family: ScalySansRemake;
    }

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
