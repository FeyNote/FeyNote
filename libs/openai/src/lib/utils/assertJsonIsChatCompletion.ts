import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export function assertJsonIsChatCompletion(
  json: unknown,
): asserts json is ChatCompletionMessageParam {
  const jsonSchema = z.object({
    role: z.enum(['function', 'tool', 'assistant', 'user']),
    content: z.string(),
  });
  jsonSchema.parse(json);
}
