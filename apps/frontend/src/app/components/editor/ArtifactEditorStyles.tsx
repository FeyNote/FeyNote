import styled from 'styled-components';

export const ArtifactEditorStyles = styled.div`
  .tiptap {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 1px;
    padding-bottom: 1px;
    min-height: 500px;
    outline: none;

    /* Give a remote user a caret */
    .collaboration-cursor__caret {
      border-left: 1px solid #0d0d0d;
      border-right: 1px solid #0d0d0d;
      margin-left: -1px;
      margin-right: -1px;
      pointer-events: none;
      position: relative;
      word-break: normal;
    }

    /* Render the username above the caret */
    .collaboration-cursor__label {
      border-radius: 3px 3px 3px 0;
      color: #0d0d0d;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      left: -1px;
      line-height: normal;
      padding: 0.1rem 0.3rem;
      position: absolute;
      top: -1.4em;
      user-select: none;
      white-space: nowrap;
    }

    --blockIndentDepth: 16px;
    [data-depth='1'] {
      margin-left: calc(var(--blockIndentDepth) * 1);
    }
    [data-depth='2'] {
      margin-left: calc(var(--blockIndentDepth) * 2);
    }
    [data-depth='3'] {
      margin-left: calc(var(--blockIndentDepth) * 3);
    }
    [data-depth='4'] {
      margin-left: calc(var(--blockIndentDepth) * 4);
    }
    [data-depth='5'] {
      margin-left: calc(var(--blockIndentDepth) * 5);
    }
    [data-depth='6'] {
      margin-left: calc(var(--blockIndentDepth) * 6);
    }
    [data-depth='7'] {
      margin-left: calc(var(--blockIndentDepth) * 7);
    }
    [data-depth='8'] {
      margin-left: calc(var(--blockIndentDepth) * 8);
    }
    [data-depth='9'] {
      margin-left: calc(var(--blockIndentDepth) * 9);
    }
    [data-depth='10'] {
      margin-left: calc(var(--blockIndentDepth) * 10);
    }
    [data-depth='11'] {
      margin-left: calc(var(--blockIndentDepth) * 11);
    }
    [data-depth='12'] {
      margin-left: calc(var(--blockIndentDepth) * 12);
    }
    [data-depth='13'] {
      margin-left: calc(var(--blockIndentDepth) * 13);
    }
    [data-depth='14'] {
      margin-left: calc(var(--blockIndentDepth) * 14);
    }
    [data-depth='15'] {
      margin-left: calc(var(--blockIndentDepth) * 15);
    }
  }

  .drag-handle {
    width: 20px;
    height: 20px;
    background: purple;
    position: fixed;
    transform: translateX(-15px);

    transition:
      opacity 70ms,
      top 100ms;

    &.hide {
      opacity: 0;
    }
  }
`;
