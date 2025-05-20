import { css } from 'styled-components';

export const feynoteAudioExtensionStyles = css`
  .feynote-audio-container {
    display: grid;
    width: min(100%, 500px);
    grid-template-columns: 1fr auto;

    border: 1px solid var(--ion-background-color-step-200);
    border-radius: 5px;

    .download-icon svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: var(--ion-color-primary);
    }

    &.ProseMirror-selectednode {
      outline: 1px solid var(--ion-color-primary);
      outline-offset: -1px;
    }
  }
`;
