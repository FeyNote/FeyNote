import { css } from 'styled-components';

export const headingExtensionStyles = css`
  .editor-heading-container {
    .editor-heading-collapse-toggle {
      position: absolute;
      left: -22px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      padding: 0;
      border: none;
      background-color: transparent;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition:
        opacity 0.15s ease,
        background-color 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sheet-text-color);
      user-select: none;

      svg {
        width: 14px;
        height: 14px;
        transition: transform 0.15s ease;
        transform: rotate(90deg);
      }
    }

    &:hover .editor-heading-collapse-toggle {
      opacity: 0.5;
    }

    .editor-heading-collapse-toggle:hover {
      opacity: 1;
      background-color: var(--floating-background);
      box-shadow: var(--floating-box-shadow);
      color: var(--text-color);
    }

    &.heading-collapsed .editor-heading-collapse-toggle {
      opacity: 0.5;

      svg {
        transform: rotate(0deg);
      }
    }

    &.heading-collapsed:hover .editor-heading-collapse-toggle {
      opacity: 1;
    }
  }

  .editor-collapsed-content {
    display: none !important;
  }

  @media print {
    .editor-heading-collapse-toggle {
      display: none !important;
    }

    .editor-collapsed-content {
      display: block !important;
    }
  }
`;
