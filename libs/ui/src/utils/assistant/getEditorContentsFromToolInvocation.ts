import {
  AllowedToolInvocation,
  tiptapToolInvocationBuilder,
  ToolName,
} from '@feynote/shared-utils';
import { starkdown } from 'starkdown';
import type { ToolInvocation } from 'ai';
import { JSONContent } from '@tiptap/core';
import { t } from 'i18next';

export const getEditorContentsFromToolInvocation = (
  invocation: ToolInvocation,
): (string | JSONContent)[] => {
  if (
    (invocation.toolName === ToolName.Generate5eObject ||
      invocation.toolName === ToolName.Generate5eMonster) &&
    invocation.args
  ) {
    const tiptapContent = tiptapToolInvocationBuilder(
      invocation as AllowedToolInvocation,
      t,
    );
    if (!tiptapContent) return [];
    return [tiptapContent];
  }
  if (
    invocation.toolName === ToolName.ScrapeUrl &&
    invocation.state === 'result'
  ) {
    const editorContents: (string | JSONContent)[] = [];
    if (invocation.result.text) {
      editorContents.push(starkdown(invocation.result.text));
    }
    if (invocation.result.toolInvocations) {
      invocation.result.toolInvocations.forEach((invocation: ToolInvocation) =>
        editorContents.push(...getEditorContentsFromToolInvocation(invocation)),
      );
    }
    return editorContents;
  }
  return [];
};
