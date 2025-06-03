import { css } from 'styled-components';

export const feynoteAudioExtensionStyles = css`
  .feynote-audio-container {
    display: grid;
    height: 34px;
    overflow: hidden;
    width: 350px;
    grid-template-columns: auto 1fr;
    align-items: center;
    justify-items: center;

    border: 1px solid var(--ion-background-color-step-200);
    border-radius: 5px;

    .feynote-audio {
      height: 30px;
      width: 320px;
    }

    .download-icon {
      display: flex;
      align-items: center;

      svg {
        fill: var(--ion-color-primary);
        height: 1rem;
      }
    }

    &.ProseMirror-selectednode {
      outline: 1px solid var(--ion-color-primary);
      outline-offset: -1px;
    }
  }
`;
