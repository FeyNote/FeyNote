import { css } from 'styled-components';

export const hyperlinkExtensionStyles = css`
  .hyperlink-preview-modal {
    .hyperlink-preview-modal__metadata {
    }

    .hyperlink-preview-modal__remove-button {
    }

    .hyperlink-preview-modal__edit-button {
    }

    .hyperlink-preview-modal__copy-button {
    }
  }

  .hyperlink-preview-modal,
  .hyperlink-set-modal,
  .hyperlink-edit-modal {
    font-family: var(--ion-font-family, inherit);
    font-size: 0.75rem;
    background: var(--ion-background-color-step-150, #ffffff);
    border-radius: 10px;
    // border: 1px solid #dadce0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px;
    padding-left: 8px;
    box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
    margin-top: -6px;

    &__metadata {
      width: 200px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-direction: row-reverse;
      a {
        color: var(--ion-text-color, #000);
        margin-right: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      img {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin-right: 8px;
      }
    }

    &__remove-button,
    &__edit-button,
    &__copy-button,
    &__apply-button,
    &__set-button {
      background: var(--ion-background-color-step-250, #ffffff);
      fill: var(--ion-text-color, #000);
      color: var(--ion-text-color, #000);
      width: 24px;
      height: 28px;
      border-radius: 4px;
      margin: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.1s ease-in-out;
      &:hover {
        background: var(--ion-background-color, #cccccc);
      }
      > svg {
        width: 14px;
        height: 14px;
      }
    }

    form {
      display: flex;
      align-items: flex-end;
      width: 100%;
      input {
        outline: none;
        border-radius: 6px;
        padding: 6px 10px;
        margin-bottom: 3px;
        width: 100%;

        background: none;
        border: 1px solid var(--ion-background-color-step-250);

        &:last-of-type {
          margin-bottom: 0;
        }
      }
      .hyperlink-set-modal__buttons-wrapper,
      .hyperlink-edit-modal__buttons-wrapper {
        margin-left: 8px;
        button {
          background: var(--ion-color-primary);
          border-radius: 6px;
          width: 70px;
          color: var(--ion-text-color, #000);
          &:hover {
            var(--ion-color-primary-contrast);
          }
        }
      }
    }
  }

  .tippy-svg-arrow {
    display: none;
  }
`;
