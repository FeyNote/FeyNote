import { openai } from './openai';
import { AIModel } from './utils/AIModel';
import { type Tool, streamText, type CoreMessage } from 'ai';

export function generateAssistantStreamText(
  messages: CoreMessage[],
  model: AIModel,
  tools: Record<string, Tool>,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = streamText({
    model: openai(model, {
      structuredOutputs: true,
      parallelToolCalls: true,
    }),
    tools,
    maxTokens: 16383,
    messages,
    toolCallStreaming: true,
  });
  return stream;
}
