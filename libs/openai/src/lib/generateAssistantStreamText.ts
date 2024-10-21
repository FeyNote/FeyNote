import { openai } from './openai';
import { AIModel } from './utils/AIModel';
import { streamText, type CoreMessage } from 'ai';
import { ToolName } from '@feynote/shared-utils';
import { Display5eMonsterTool } from './tools/display5eMonster';
import { Display5eObjectTool } from './tools/display5eObject';
import { DisplayUrlTool } from './tools/displayUrlContent';

const tools = {
  [ToolName.Generate5eMonster]: Display5eMonsterTool,
  [ToolName.Generate5eObject]: Display5eObjectTool,
  [ToolName.ScrapeUrl]: DisplayUrlTool,
};

export async function generateAssistantStreamText(
  messages: CoreMessage[],
  model: AIModel,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = await streamText({
    model: openai(AIModel.GPT4_MINI, {
      structuredOutputs: true,
      parallelToolCalls: true,
    }),
    tools,
    maxTokens: 16383,
    messages,
    experimental_toolCallStreaming: true,
  });
  return stream;
}
