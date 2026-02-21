import { generateText, type Tool, type ModelMessage } from 'ai';
import { aiProvider } from './ai';

export async function generateAssistantText(
  messages: ModelMessage[],
  model: string,
  tools?: Record<string, Tool>,
): ReturnType<typeof generateText> {
  const result = await generateText({
    model: aiProvider(model),
    tools,
    maxOutputTokens: 16383,
    messages,
  });

  return result;
}
