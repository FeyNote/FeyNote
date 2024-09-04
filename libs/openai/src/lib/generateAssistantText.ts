import { generateText, type CoreMessage } from 'ai';
import type { AIModel } from './utils/AIModel';
import { openai } from './openai';

export async function generateAssistantText(
  messages: CoreMessage[],
  model: AIModel,
) {
  const { text } = await generateText({
    model: openai(model),
    maxTokens: 4096,
    messages,
  });

  return text;
}
