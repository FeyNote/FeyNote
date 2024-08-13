import { prisma } from '@feynote/prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export async function retrieveMessageContext(
  threadId: string,
): Promise<ChatCompletionMessageParam[]> {
  //TODO: Retrieve Context Size from User Subscription https://github.com/RedChickenCo/FeyNote/issues/84
  const contextHistorySize = 10;

  const messages = await prisma.message.findMany({
    where: { threadId },
    take: contextHistorySize,
    orderBy: {
      createdAt: 'asc',
    },
  });

  const context = messages.map(
    (message) => message.json as unknown as ChatCompletionMessageParam,
  );
  return context;
}
