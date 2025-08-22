import { type Tool, streamText, type ModelMessage } from 'ai';
import type { OpenAIProvider } from '@ai-sdk/openai';
import type { AIModel } from './utils/AIModel';

export function generateAssistantStreamText(
  openai: OpenAIProvider,
  messages: ModelMessage[],
  model: AIModel,
  tools: Record<string, Tool>,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = streamText({
    model: openai(model),
    tools,
    maxOutputTokens: 16383,
    messages,
  });
  return stream;
}
