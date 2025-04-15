import styled from 'styled-components';
import { collaborationCursorExtensionStyles } from './tiptap/extensions/collaborationCursorExtensionStyles';
import { indentationExtensionStyles } from './tiptap/extensions/indentation/indentationExtensionStyles';
import { placeholderExtensionStyles } from './tiptap/extensions/placeholderExtensionStyles';
import { globalDragHandleExtensionStyles } from './tiptap/extensions/globalDragHandle/globalDragHandleExtensionStyles';
import { monsterStatsheetExtensionStyles } from './tiptap/extensions/statsheet/monsterStatblock/monsterStatsheetExtensionStyles';
import { spellSheetExtensionStyles } from './tiptap/extensions/statsheet/spellSheet/spellSheetExtensionStyles';
import { ttrpgNoteExtensionStyles } from './tiptap/extensions/ttrpgNote/ttrpgNoteExtensionStyles';
import { themeVariables } from './themeVariables';
import { hyperlinkExtensionStyles } from './tiptap/extensions/link/hyperlinkExtensionStyles';
import { feynoteImageExtensionStyles } from './tiptap/extensions/feynoteImage/feynoteImageExtensionStyles';
import { diceDecorationExtensionStyles } from './tiptap/extensions/diceDecoration/diceDecorationExtensionStyles';

export const ArtifactEditorStyles = styled.div`
  ${themeVariables.default}

  text-rendering: optimizeLegibility;
  font-family: var(--sheet-font-family);
  color: var(--sheet-text-color);

  @media print {
    padding: 16px;
  }

  .tiptap {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 1px;
    padding-bottom: 1px;
    min-height: 500px;
    outline: none;
  }

  .ProseMirror-gapcursor:after {
    border-top: 1px solid var(--sheet-text-color);
  }

  .artifactTitle {
    --background: transparent;
    --color: var(--sheet-h1-color);
    --ion-font-family: var(--sheet-h1-font-family);
    font-size: 2.1rem;
    padding-top: 10px;
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
    margin-bottom: 8px;
    font-size: 1.1rem;
    color: var(--sheet-h5-color);
    font-family: var(--sheet-h5-font-family);
  }

  h6 {
    margin-top: 16px;
    margin-bottom: 6px;
    font-size: 0.95rem;
    color: var(--sheet-h6-color);
    font-family: var(--sheet-h6-font-family);
  }

  p {
    font-size: 0.875rem;
    margin-top: 10px;
    margin-bottom: 10px;
    line-height: 1.25;
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
    border: 1px solid var(--sheet-text-color);
  }

  th,
  td {
    padding-left: 8px;
    padding-right: 8px;
  }

  ul,
  ol {
    padding: 0 1rem;
    margin-left: 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  ul[data-type='taskList'] {
    list-style: none;
    margin-left: 0;
    padding: 0;

    li {
      align-items: flex-start;
      display: flex;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }

    input[type='checkbox'] {
      cursor: pointer;
    }

    ul[data-type='taskList'] {
      margin: 0;
    }
  }

  .editor-paragraph-container,
  .editor-heading-container {
    position: relative;
  }

  .editor-incoming-edge-counter {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--ion-background-color-step-100);
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    font-size: 0.8rem;
    display: none;
    text-align: center;

    cursor: pointer;
    user-select: none;
  }

  &[data-theme='classic'] {
    ${themeVariables.classic}

    background: url('https://static.feynote.com/assets/parchment-background-20240925.jpg');
    background-color: #eee5ce;
    .dark & {
      background:
        linear-gradient(rgba(0, 0, 0, 0.09), rgba(0, 0, 0, 0.09)),
        url('https://static.feynote.com/assets/parchment-background-20240925.jpg');
    }
    box-shadow: 1px 4px 14px rgba(0, 0, 0, 0.4);

    @media print {
      box-shadow: none;
    }
  }

  ${collaborationCursorExtensionStyles}
  ${indentationExtensionStyles}
  ${placeholderExtensionStyles}
  ${globalDragHandleExtensionStyles}
  ${monsterStatsheetExtensionStyles}
  ${spellSheetExtensionStyles}
  ${ttrpgNoteExtensionStyles}
  ${hyperlinkExtensionStyles}
  ${feynoteImageExtensionStyles}
  ${diceDecorationExtensionStyles}
`;
