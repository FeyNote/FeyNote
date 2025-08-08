import { ToolName } from '@feynote/shared-utils';
import * as Sentry from '@sentry/react';
import type { ToolUIPart } from 'ai';

export const isDisplayableToolPart = (
  part: ToolUIPart,
): boolean => {
  const toolName = part.type.replace('tool-', '')
  switch(toolName) {
    case ToolName.ScrapeUrl:
      return part.state === 'output-available';
    case ToolName.Generate5eMonster:
    case ToolName.Generate5eObject:
      return part.state === 'input-streaming' || part.state === 'input-available'
    default:
      Sentry.captureMessage(`Invalid tool part detected; ${part}`);
      return false
  }
};
