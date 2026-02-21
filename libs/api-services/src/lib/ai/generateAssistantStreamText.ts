import { type Tool, streamText, type ModelMessage } from 'ai';
import { aiProvider } from './ai';

export function generateAssistantStreamText(
  messages: ModelMessage[],
  model: string,
  tools: Record<string, Tool>,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = streamText({
    model: aiProvider(model),
    tools,
    maxOutputTokens: 16383,
    messages,
  });
  return stream;
}
