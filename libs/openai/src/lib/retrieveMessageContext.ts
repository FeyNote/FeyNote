import { prisma } from '@feynote/prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { assertJsonIsChatCompletion } from './tools/assertJsonIsChatCompletion';

export async function retrieveMessageContext(
  threadId: string,
  userId: string,
): Promise<ChatCompletionMessageParam[]> {
  //TODO: Implement User Context History Size
  // ---
  const contextHistorySize = 20;
  // ---

  const messages = await prisma.message.findMany({
    where: { id: threadId },
    take: contextHistorySize,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const context = messages.map((message) => {
    const json = message.json;
    assertJsonIsChatCompletion(json);
    return json;
  });
  return context;
}
