import styled from 'styled-components';

const suggestionListContainerStyles = `
  font-family: var(--ion-font-family);
  width: min(350px, 100vw);
  background-color: var(--ion-card-background);
  border-radius: 4px;
  box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.4);
  color: var(--ion-text-color);
  overflow-y: auto;
  padding: 4px;
`;

const suggestionListSectionLabelStyles = `
  padding-left: 8px;
  font-size: 0.75rem;
  margin-top: 6px;
  margin-bottom: 6px;
`;

const suggestionListItemStyles = `
  display: grid;
  grid-template-columns: 50px auto min-content;
  align-items: center;
  text-align: left;
  cursor: pointer;

  border-radius: 4px;

  color: var(--ion-text-color);
  background-color: var(--ion-card-background);

  width: 100%;
  height: 52px;

  &.selected, &[aria-selected="true"] {
    background-color: var(--ion-background-color);
  }

  &:hover {
    background-color: var(--ion-background-color);
  }
`;

const suggestionListItemIconStyles = `
  text-align: center;
  background-color: var(--ion-background-color);
  height: 34px;
  width: 34px;
  border-radius: 6px;
  margin-right: 4px;

  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
`;

const suggestionListItemShortcutStyles = `
  text-align: center;
  background-color: var(--ion-background-color);
  border-radius: 20px;
  padding-left: 7px;
  padding-right: 7px;
  padding-top: 4px;
  padding-bottom: 4px;
  font-size: 0.7rem;
  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
`;

const suggestionListItemTitleStyles = `
  margin: 0;
  margin-bottom: 2px;
  font-size: 0.95rem;
`;

const suggestionListItemSubtitleStyles = `
  color: rgba(var(--ion-text-color-rgb), 0.8);
  margin: 0;
  color: rgba(255,255,255,0.8);
  font-size: 0.7rem;
`;

const themedCSSVariables = {
  default: `
    --sheet-text-color: var(--ion-text-color);
    --sheet-font-family: var(--ion-font-family);
    --sheet-header-color: var(--ion-text-color);
    --sheet-header-font-family: var(--ion-font-family);
    --sheet-placeholder-color: rgba(255,255,255,0.7);
  `,
  classic: `
    --sheet-text-color: black;
    --sheet-font-family: BookInsanityRemake;
    --sheet-header-color: #58180D;
    --sheet-header-font-family: MrEavesRemake;
    --sheet-placeholder-color: rgba(0,0,0,0.7);
  `,
};

export const BaseSheet = styled.div<{
  $focused: boolean;
}>`
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

export const BNStylesTest = styled.div<{
  $focused: boolean;
}>`
  ${themedCSSVariables.default}

  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 8px;
  padding-right: 8px;

  text-rendering: optimizeLegibility;

  font-family: var(--sheet-font-family);

  .bn-editor {
    outline: none;
  }

  .bn-container {
    margin-left: 16px;
    color: var(--sheet-text-color);
  }

  .bn-side-menu {
    box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
    margin-right: 16px;
    border-radius: 4px;
    padding: 2px;
    background: var(--ion-card-background);

    button {
      background: var(--ion-card-background);
      color: white;
      border-radius: 4px;

      &:hover {
        background-color: var(--ion-background-color);
      }
    }

    svg {
      vertical-align: middle;
    }
  }

  .bn-table-handle {
    box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
    background: var(--ion-card-background);
    color: white;
    border-radius: 4px;

    svg {
      vertical-align: middle;
    }
  }

  .bn-block-group .bn-block-group {
    margin-left: 16px;
  }

  .bn-inline-content:has(> .ProseMirror-trailingBreak)::before {
    pointer-events: none;
    height: 0;
    position: absolute;
    font-style: italic;
    color: var(--sheet-placeholder-color);
  }

  .bn-suggestion-menu {
    ${suggestionListContainerStyles}

    .bn-suggestion-menu-label {
      ${suggestionListSectionLabelStyles}
    }

    .bn-suggestion-menu-item {
      ${suggestionListItemStyles}

      .bn-mt-suggestion-menu-item-section:nth-child(1) {
        ${suggestionListItemIconStyles}
      }

      .bn-mt-suggestion-menu-item-body {
        .bn-mt-suggestion-menu-item-title {
          ${suggestionListItemTitleStyles}
        }

        .bn-mt-suggestion-menu-item-subtitle {
          ${suggestionListItemSubtitleStyles}
        }
      }

      .bn-mt-suggestion-menu-item-section:nth-child(3) {
        ${suggestionListItemShortcutStyles}
      }
    }
  }

  .bn-menu-dropdown {
    position: absolute;
    font-family: var(--ion-font-family);
    background-color: var(--ion-card-background);
    border-radius: 4px;
    min-width: 125px;
    box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.4);
    color: var(--ion-text-color);
    padding: 4px;

    .mantine-Menu-item {
      background: transparent;
      width: 100%;
      height: 25px;
      border-radius: 4px;
      text-align: left;
      display: flex;
      align-items: center;

      .mantine-Menu-itemLabel {
        width: 100%;
        margin-right: 6px;

        > [aria-haspopup='menu'] {
          display: flex;
          justify-content: space-between;
        }
      }

      [data-position='right'] {
        margin-left: auto;
      }

      &.selected,
      &[aria-selected='true'] {
        background-color: var(--ion-background-color);
      }

      &:hover {
        background-color: var(--ion-background-color);
      }
    }

    .bn-color-icon {
      margin-right: 6px;
      align-items: center;
      border: rgba(var(--ion-text-color-rgb), 0.5);
      border-radius: 4px;
      display: flex;
      justify-content: center;
    }

    .mantine-Menu-item,
    .mantine-Menu-label {
      text-align: left;
      padding-left: 12px;
      padding-right: 12px;
      padding-top: 5px;
      padding-bottom: 5px;

      button {
        text-align: left;
      }
    }
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

  &[data-theme='classic'] {
    ${themedCSSVariables.classic}

    background-color: #EEE5CE;
    background-image: url('/assets/parchment-background.jpg');
    box-shadow: 1px 4px 14px rgba(0, 0, 0, 0.4);

    h3 {
      border-bottom: 2px solid #c0ad6a;
    }

    hr {
      height: 2px;
      background-color: #c0ad6a;
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
`;
