import styled from 'styled-components';
import { themeVariables } from '../editor/themeVariables';

export const ArtifactCalendarStyles = styled.div`
  ${themeVariables.default}

  text-rendering: optimizeLegibility;
  font-family: var(--sheet-font-family);
  --ion-font-family: var(--sheet-font-family);
  color: var(--sheet-text-color);

  .artifactTitle {
    --background: transparent;
    --color: var(--sheet-h1-color);
    --ion-font-family: var(--sheet-h1-font-family);
    font-size: 2.1rem;
    padding-top: 10px;
  }

  --day-border-color: gray;

  &[data-theme='classic'] {
    ${themeVariables.classic}

    background: url('/assets/parchment-background.jpg');
    background-color: #eee5ce;
    .dark & {
      background: linear-gradient(rgba(0, 0, 0, 0.09), rgba(0, 0, 0, 0.09)),
        url('/assets/parchment-background.jpg');
    }
    box-shadow: 1px 4px 14px rgba(0, 0, 0, 0.4);
  }
`;
