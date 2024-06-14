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

export const ArtifactEditorStyles = styled.div`
  ${themeVariables.default}

  text-rendering: optimizeLegibility;
  font-family: var(--sheet-font-family);
  color: var(--sheet-text-color);

  .placeholder {
    color: var(--sheet-placeholder-color);
  }

  &[data-theme='classic'] {
    ${themeVariables.classic}

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

  ${collaborationCursorExtensionStyles}
  ${indentationExtensionStyles}
  ${placeholderExtensionStyles}
  ${globalDragHandleExtensionStyles}
  ${monsterStatsheetExtensionStyles}
  ${spellSheetExtensionStyles}
  ${ttrpgNoteExtensionStyles}

  .tiptap {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 1px;
    padding-bottom: 1px;
    min-height: 500px;
    outline: none;
  }
`;
