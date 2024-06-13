import styled from 'styled-components';

const baseSheetStyles = `
  .bn-block:has(.monster-sheet) {
    min-width: min(450px, 100%);
    max-width: 500px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 8px;
    padding-right: 8px;

    text-rendering: optimizeLegibility;
    background-color: #f2e5b5;
    background-image: url('/assets/parchment-background-grayscale.jpg');
    background-blend-mode: overlay;
    border-style: solid;
    border-width: 7px 6px;
    border-image: url('/assets/monster-border.png') 14 round;
    border-image-outset: 0px 2px;
    box-shadow: 1px 4px 14px rgba(0, 0, 0, 0.4);

    font-family: BookInsanityRemake;
    font-size: 0.318cm;
    line-height: 1.2em;

    color: black;

    outline: none !important;

    .bn-block-group {
      outline: none;

      * {
        font-family: BookInsanityRemake;
      }

      h2 {
        margin: 0;
        font-family: MrEavesRemake;
        font-size: 0.62cm;
        line-height: 1em;
        color: #58180d;
      }

      h3 {
        font-family: ScalySansCapsRemake;
        font-size: 0.45cm;
        border-bottom: 1.5px solid #58180d;
        margin-top: 0.155cm;
        margin-bottom: 10px;
        line-height: 0.995em;
        color: #58180d;
        font-weight: bold;
      }

      h4 {
        font-family: MrEavesRemake;
        font-size: 0.45cm;
        line-height: 0.995em;
        margin-top: 0;
        margin-bottom: 4px;
        color: #58180d;
        font-weight: bold;
      }

      h2 + p {
        margin-bottom: 0;
        font-size: 0.304cm;
      }

      hr {
        height: 6px;
        margin-top: 8px;
        margin-bottom: 8px;
        visibility: visible;
        background-image: url('/assets/red-triangle.png');
        background-size: 100% 100%;
        background-color: unset;
        border: none;
      }

      dl {
        color: #58180d;
        line-height: 1.2em;
        padding-left: 1em;
        white-space: pre-line;
      }

      dt {
        margin-right: 5px;
        margin-left: -1em;
        display: inline;
      }

      dd {
        display: inline;
        margin-left: 0;
        text-indent: 0;
      }

      table {
        margin: 0;
        column-span: none;
        color: #58180d;
        background-color: transparent;
        border-style: none;
        border-image: none;
        line-height: 16px;
        break-inside: avoid;
        width: 100% !important;
        border: 0;

        thead,
        th {
          text-align: initial;
          padding: initial;
          min-width: initial;
          font-weight: 800;
        }

        td {
          padding: initial;
          min-width: initial;
        }
      }
    }
  }
`;

export const BaseSheet = styled.div<{
  $focused: boolean;
}>`
  ${baseSheetStyles}
`;

export const BNStylesTest = styled.div<{
  $focused: boolean;
}>`
  text-rendering: optimizeLegibility;

  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 8px;
  padding-right: 8px;

  font-family: var(--sheet-font-family);
  color: var(--sheet-text-color);

  .placeholder {
    color: var(--sheet-placeholder-color);
  }

  h1 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 2.1rem;
    color: var(--sheet-header-color);
    font-family: var(--sheet-header-font-family);
  }

  h2 {
    margin-top: 18px;
    margin-bottom: 10px;
    font-size: 1.75rem;
    color: var(--sheet-header-color);
    font-family: var(--sheet-header-font-family);
  }

  h3 {
    margin-top: 16px;
    margin-bottom: 10px;
    font-size: 1.37rem;
    color: var(--sheet-header-color);
    font-family: var(--sheet-header-font-family);
  }

  h4 {
    margin-top: 14px;
    margin-bottom: 10px;
    font-size: 1.08rem;
    color: var(--sheet-header-color);
    font-family: var(--sheet-header-font-family);
  }

  p {
    font-size: 0.85rem;
  }

  hr {
    height: 1px;
    background-color: rgba(255, 255, 255, 0.3);
    margin-top: 8px;
    margin-bottom: 8px;
    border: none;
  }

  table {
    table-layout: fixed;
    column-span: none;
    background-color: transparent;
    border-style: none;
    border-image: none;
    break-inside: avoid;
    width: 100%;
    border: 0;
    overflow: hidden;

    thead,
    th {
      font-weight: 800;
    }
  }

  th,
  tr,
  td {
    border: 1px solid transparent;
  }

  .ProseMirror-focused {
    th,
    tr,
    td {
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
  }

  [data-text-color='gray'] {
    color: #9b9a97;
  }
  [data-text-color='brown'] {
    color: #64473a;
  }
  [data-text-color='red'] {
    color: #e03e3e;
  }
  [data-text-color='orange'] {
    color: #d9730d;
  }
  [data-text-color='yellow'] {
    color: #dfab01;
  }
  [data-text-color='green'] {
    color: #4d6461;
  }
  [data-text-color='blue'] {
    color: #0b6e99;
  }
  [data-text-color='purple'] {
    color: #6940a5;
  }
  [data-text-color='pink'] {
    color: #ad1a72;
  }

  [data-background-color='gray'] {
    background-color: #ebeced;
  }
  [data-background-color='brown'] {
    background-color: #e9e5e3;
  }
  [data-background-color='red'] {
    background-color: #fbe4e4;
  }
  [data-background-color='orange'] {
    background-color: #f6e9d9;
  }
  [data-background-color='yellow'] {
    background-color: #fbf3db;
  }
  [data-background-color='green'] {
    background-color: #ddedea;
  }
  [data-background-color='blue'] {
    background-color: #ddebf1;
  }
  [data-background-color='purple'] {
    background-color: #eae4f2;
  }
  [data-background-color='pink'] {
    background-color: #f4dfeb;
  }

  ${baseSheetStyles}
`;
