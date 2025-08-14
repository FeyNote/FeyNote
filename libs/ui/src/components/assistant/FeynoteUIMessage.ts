import type { Display5eMonsterTool, Display5eObjectTool, DisplayUrlTool, ToolName } from "@feynote/shared-utils";
import type { UIDataTypes, UIMessage } from "ai";

export type FeynoteUITool = {
  [ToolName.Display5eObject]: Display5eObjectTool;
  [ToolName.Display5eMonster]: Display5eMonsterTool;
  [ToolName.DisplayUrl]: DisplayUrlTool;
}

export type FeynoteUIMessage = UIMessage<unknown, UIDataTypes, FeynoteUITool>
