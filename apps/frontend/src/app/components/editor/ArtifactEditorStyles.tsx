import styled from 'styled-components';
import { collaborationCursorExtensionStyles } from './tiptap/extensions/collaborationCursorExtensionStyles';
import { indentationExtensionStyles } from './tiptap/extensions/indentation/indentationExtensionStyles';
import { placeholderExtensionStyles } from './tiptap/extensions/placeholderExtensionStyles';
import { globalDragHandleExtensionStyles } from './tiptap/extensions/globalDragHandle/globalDragHandleExtensionStyles';
import { monsterStatsheetExtensionStyles } from './tiptap/extensions/statsheet/monsterStatblock/monsterStatsheetExtensionStyles';
import { spellSheetExtensionStyles } from './tiptap/extensions/statsheet/spellSheet/spellSheetExtensionStyles';
import { ttrpgNoteExtensionStyles } from './tiptap/extensions/ttrpgNote/ttrpgNoteExtensionStyles';

const themeVariables = {
  default: `
    --sheet-text-color: var(--ion-text-color);
    --sheet-font-family: var(--ion-font-family);
    --sheet-h1-color: var(--ion-text-color);
    --sheet-h1-font-family: var(--ion-font-family);
    --sheet-h2-color: var(--ion-text-color);
    --sheet-h2-font-family: var(--ion-font-family);
    --sheet-h3-color: var(--ion-text-color);
    --sheet-h3-font-family: var(--ion-font-family);
    --sheet-h4-color: var(--ion-text-color);
    --sheet-h4-font-family: var(--ion-font-family);
    --sheet-h5-color: var(--ion-text-color);
    --sheet-h5-font-family: var(--ion-font-family);
    --sheet-h6-color: var(--ion-text-color);
    --sheet-h6-font-family: var(--ion-font-family);
    --sheet-placeholder-color: rgba(255,255,255,0.7);
  `,
  classic: `
    --sheet-text-color: black;
    --sheet-font-family: BookInsanityRemake;
    --sheet-h1-color: #58180D;
    --sheet-h1-font-family: MrEavesRemake;
    --sheet-h2-color: #58180D;
    --sheet-h2-font-family: MrEavesRemake;
    --sheet-h3-color: #58180D;
    --sheet-h3-font-family: MrEavesRemake;
    --sheet-h4-color: #58180D;
    --sheet-h4-font-family: MrEavesRemake;
    --sheet-h5-color: black;
    --sheet-h5-font-family: ScalySansCapsRemake;
    --sheet-h6-color: black;
    --sheet-h6-font-family: ScalySansCapsRemake;
    --sheet-placeholder-color: rgba(0,0,0,0.7);
  `,
};

export const ArtifactEditorStyles = styled.div`
  ${themeVariables.default}

  text-rendering: optimizeLegibility;
  font-family: var(--sheet-font-family);
  color: var(--sheet-text-color);

  .tiptap {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 1px;
    padding-bottom: 1px;
    min-height: 500px;
    outline: none;
  }

  h1 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 2.1rem;
    color: var(--sheet-h1-color);
    font-family: var(--sheet-h1-font-family);
  }

  h2 {
    margin-top: 18px;
    margin-bottom: 10px;
    font-size: 1.75rem;
    color: var(--sheet-h2-color);
    font-family: var(--sheet-h2-font-family);
  }

  h3 {
    margin-top: 16px;
    margin-bottom: 10px;
    font-size: 1.5rem;
    color: var(--sheet-h3-color);
    font-family: var(--sheet-h3-font-family);
  }

  h4 {
    margin-top: 16px;
    margin-bottom: 10px;
    font-size: 1.35rem;
    color: var(--sheet-h4-color);
    font-family: var(--sheet-h4-font-family);
  }

  h5 {
    margin-top: 16px;
    margin-bottom: 10px;
    font-size: 1.1rem;
    color: var(--sheet-h5-color);
    font-family: var(--sheet-h5-font-family);
  }

  h6 {
    margin-top: 16px;
    margin-bottom: 10px;
    font-size: 0.95rem;
    color: var(--sheet-h6-color);
    font-family: var(--sheet-h6-font-family);
  }

  p {
    font-size: 0.875rem;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  hr {
    height: 1px;
    background: var(--ion-color-medium);
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
    ${themeVariables.classic}

    background-color: #EEE5CE;
    background-image: url('/assets/parchment-background.jpg');
    box-shadow: 1px 4px 14px rgba(0, 0, 0, 0.4);

    h3 {
      border-bottom: 2px solid #c0ad6a;
    }

    h5,
    h6 {
      font-weight: bold;
    }

    hr {
      height: 2px;
      background-color: #c0ad6a;
    }
  }

  ${collaborationCursorExtensionStyles}
  ${indentationExtensionStyles}
  ${placeholderExtensionStyles}
  ${globalDragHandleExtensionStyles}
  ${monsterStatsheetExtensionStyles}
  ${spellSheetExtensionStyles}
  ${ttrpgNoteExtensionStyles}
`;
