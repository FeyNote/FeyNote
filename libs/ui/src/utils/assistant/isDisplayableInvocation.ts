import { ToolName } from '@feynote/shared-utils';
import * as Sentry from '@sentry/react';
import type { UIDataTypes, UIMessagePart } from 'ai';
import type { FeynoteUITool } from '../../components/assistant/FeynoteUIMessage';

export const isDisplayableToolPart = (
  part: UIMessagePart<UIDataTypes, FeynoteUITool>,
): boolean => {
  switch(part.type) {
    case `tool-${ToolName.DisplayUrl}`:
      return part.state === 'output-available';
    case `tool-${ToolName.Display5eMonster}`:
    case `tool-${ToolName.Display5eObject}`:
      return part.state === 'input-streaming' || part.state === 'input-available'
    default:
      Sentry.captureMessage(`Invalid tool part detected; ${part}`);
      return false
  }
};
