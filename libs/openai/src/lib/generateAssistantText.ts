import { generateText, type CoreMessage } from 'ai';
import type { AIModel } from './utils/AIModel';
import { openai } from './openai';

export async function generateAssistantText(
  messages: CoreMessage[],
  model: AIModel,
) {
  const { text, usage } = await generateText({
    model: openai(model),
    maxTokens: 16383,
    messages,
  });
  console.log(usage);

  return text;
}
