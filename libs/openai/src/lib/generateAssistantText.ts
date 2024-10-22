import {
  generateText,
  type GenerateTextResult,
  type CoreTool,
  type CoreMessage,
} from 'ai';
import type { AIModel } from './utils/AIModel';
import { openai } from './openai';

export async function generateAssistantText(
  messages: CoreMessage[],
  model: AIModel,
  tools: Record<string, CoreTool>,
): Promise<GenerateTextResult<Record<string, CoreTool>>> {
  const result = await generateText({
    model: openai(model, {
      structuredOutputs: true,
      parallelToolCalls: true,
    }),
    tools,
    maxTokens: 16383,
    messages,
  });

  return result;
}
