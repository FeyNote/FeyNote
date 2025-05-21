import { ToolName } from '@feynote/shared-utils';
import type { ToolInvocation } from 'ai';

export const isDisplayableInvocation = (
  invocation: ToolInvocation,
): boolean => {
  return (
    (invocation.toolName === ToolName.ScrapeUrl &&
      invocation.state === 'result') ||
    invocation.args
  );
};
