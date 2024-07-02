import { prisma } from '@feynote/prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { assertJsonIsChatCompletion } from './tools/assertJsonIsChatCompletion';

export async function retrieveMessageContext(
  threadId: string,
): Promise<ChatCompletionMessageParam[]> {
  //TODO: Implement User Context History Size
  // ---
  const contextHistorySize = 10;
  // ---

  const messages = await prisma.message.findMany({
    where: { threadId },
    take: contextHistorySize,
    orderBy: {
      createdAt: 'asc',
    },
  });

  const context = messages.map((message) => {
    const json = message.json;
    assertJsonIsChatCompletion(json);
    return json;
  });
  return context;
}
