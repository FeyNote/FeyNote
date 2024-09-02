import { convertToCoreMessages, generateText, type CoreMessage } from 'ai';
import type { Model } from './utils/Model';
import { openai } from '@ai-sdk/openai';

export async function generateAssistantText(
  messages: CoreMessage[],
  model: Model,
) {
  const { text } = await generateText({
    model: openai(model),
    maxTokens: 4096,
    messages,
  });

  return text;
}
