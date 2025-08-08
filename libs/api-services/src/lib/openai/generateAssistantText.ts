import { generateText, type Tool, type ModelMessage } from 'ai';
import type { AIModel } from './utils/AIModel';
import { openai } from './openai';

export async function generateAssistantText(
  messages: ModelMessage[],
  model: AIModel,
  tools?: Record<string, Tool>,
) {
  const modelOpts =
    tools && Object.keys(tools).length
      ? {
          structuredOutputs: true,
          parallelToolCalls: true,
        }
      : {};
  const result = await generateText({
    model: openai(model, modelOpts),
    tools,
    maxOutputTokens: 16383,
    messages,
  });

  return result;
}
