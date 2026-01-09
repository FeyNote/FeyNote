import { generateText, type Tool, type ModelMessage } from 'ai';
import type { AIModel } from './utils/AIModel';
import { openai } from '@ai-sdk/openai';

export async function generateAssistantText(
  messages: ModelMessage[],
  model: AIModel,
  tools?: Record<string, Tool>,
): ReturnType<typeof generateText> {
  const result = await generateText({
    model: openai(model),
    tools,
    maxOutputTokens: 16383,
    messages,
  });

  return result;
}
