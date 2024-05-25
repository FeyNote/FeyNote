import styled from 'styled-components';

export const BaseSheet = styled.div<{
  $focused: boolean;
}>`
  all: initial;

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

  outline: none !important;

  .tiptap {
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

      th,
      tr,
      td {
        border: 1px solid
          ${(props) => (props.$focused ? 'rgba(0,0,0,0.1)' : 'transparent')};
      }

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
`;
