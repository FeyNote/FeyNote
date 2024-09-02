import { openai } from './openai';
import { Model } from './utils/Model';
import { streamText, type CoreMessage } from 'ai';
import { FunctionName, Generate5eMonsterTool } from '@feynote/shared-utils';

const tools = {
  [FunctionName.Generate5eMonster]: Generate5eMonsterTool,
};

export async function generateAssistantStreamText(
  messages: CoreMessage[],
  model: Model,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = await streamText({
    model: openai(model),
    tools,
    maxTokens: 4096,
    messages,
    experimental_toolCallStreaming: true,
  });
  return stream;
}
