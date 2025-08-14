import { generateText, type Tool, type ModelMessage } from 'ai';
import type { AIModel } from './utils/AIModel';

export async function generateAssistantText(
  messages: ModelMessage[],
  model: AIModel,
  tools?: Record<string, Tool>,
) {
  const result = await generateText({
    model: openai(model),
    tools,
    maxOutputTokens: 16383,
    messages,
  });

  return result;
}
