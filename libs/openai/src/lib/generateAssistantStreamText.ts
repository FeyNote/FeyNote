import { openai } from './openai';
import { AIModel } from './utils/AIModel';
import { streamText, type CoreMessage } from 'ai';
import { ToolName } from '@feynote/shared-utils';
import { Generate5eMonsterTool } from './tools/generate5eMonster';
import { Generate5eObjectTool } from './tools/generate5eObject';
import { ScrapeUrlTool } from './tools/scrapeUrl';

const tools = {
  [ToolName.Generate5eMonster]: Generate5eMonsterTool,
  [ToolName.Generate5eObject]: Generate5eObjectTool,
  [ToolName.ScrapeUrl]: ScrapeUrlTool,
};

export async function generateAssistantStreamText(
  messages: CoreMessage[],
  model: AIModel,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = await streamText({
    model: openai(AIModel.GPT4_MINI, {
      structuredOutputs: true,
    }),
    tools,
    maxTokens: 16383,
    messages,
    experimental_toolCallStreaming: true,
  });
  return stream;
}
