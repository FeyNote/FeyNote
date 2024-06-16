import { css } from 'styled-components';
import { themeVariables } from '../../../themeVariables';

export const ttrpgNoteExtensionStyles = css`
  [data-ttrpg-note] {
    ${themeVariables.classic}

    width: min(350px, 100%);
    padding: 4.913px 6.047px;
    margin-top: 22px;
    margin-bottom: 22px;

    font-family: 'ScalySansRemake';
    font-size: 0.751rem;
    color: black;
    line-height: 1.2rem;

    background-color: #e0e5c1;
    border-style: solid;
    border-width: 1px;
    border-image: url('/assets/note-border.png') 12 stretch;
    border-image-outset: 0;
    border-image-width: 1;
    border-image-width: 11px;
    border-image-outset: 9px 0px;
    box-shadow: 1px 4px 14px rgba(0, 0, 0, 0.4);

    > h5:first-child,
    > h6:first-child {
      margin-top: 4px;
    }
  }
`;
