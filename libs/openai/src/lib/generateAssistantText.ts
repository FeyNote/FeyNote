import { generateText, type CoreMessage } from 'ai';
import type { AIModel } from './utils/AIModel';
import { openai } from './openai';

export async function generateAssistantText(
  messages: CoreMessage[],
  model: AIModel,
) {
  const { text } = await generateText({
    model: openai(model, {
      structuredOutputs: true,
      parallelToolCalls: true,
    }),
    maxTokens: 16383,
    messages,
  });

  return text;
}
