import { openai } from './openai';
import { AIModel } from './utils/AIModel';
import { streamText, type CoreMessage } from 'ai';
import {
  FunctionName,
  Generate5eMonsterTool,
  Generate5eObjectTool,
} from '@feynote/shared-utils';

const tools = {
  [FunctionName.Generate5eObject]: Generate5eObjectTool,
  [FunctionName.Generate5eMonster]: Generate5eMonsterTool,
};

export async function generateAssistantStreamText(
  messages: CoreMessage[],
  model: AIModel,
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
