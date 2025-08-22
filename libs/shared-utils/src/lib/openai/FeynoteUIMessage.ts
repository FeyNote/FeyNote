import type { UIDataTypes, UIMessage } from 'ai';
import type { ToolName } from './ToolName';
import type { Generate5eObjectTool } from './schemas/Generate5eObjectSchema';
import type { Generate5eMonsterTool } from './schemas/generate5eMonsterSchema';
import type { ScrapeUrlTool } from './schemas/scrapeUrlContent';

export type FeynoteUITool = {
  [ToolName.Generate5eObject]: Generate5eObjectTool;
  [ToolName.Generate5eMonster]: Generate5eMonsterTool;
  [ToolName.ScrapeUrl]: ScrapeUrlTool;
};

export type FeynoteUIMessage = UIMessage<unknown, UIDataTypes, FeynoteUITool>;
