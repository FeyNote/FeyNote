import type { UIDataTypes, UIMessage } from 'ai';
import type { ToolName } from './ToolName';
import type { Display5eObjectTool } from './schemas/display5eObjectSchema';
import type { Display5eMonsterTool } from './schemas/display5eMonsterSchema';
import type { DisplayUrlTool } from './schemas/displayUrlContent';

export type FeynoteUITool = {
  [ToolName.Display5eObject]: Display5eObjectTool;
  [ToolName.Display5eMonster]: Display5eMonsterTool;
  [ToolName.DisplayUrl]: DisplayUrlTool;
};

export type FeynoteUIMessage = UIMessage<unknown, UIDataTypes, FeynoteUITool>;
