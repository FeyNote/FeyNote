import { openai } from './openai';
import { AIModel } from './utils/AIModel';
import { type CoreTool, streamText, type CoreMessage } from 'ai';

export async function generateAssistantStreamText(
  messages: CoreMessage[],
  model: AIModel,
  tools: Record<string, CoreTool>,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = await streamText({
    model: openai(model, {
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
