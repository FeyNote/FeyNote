import { prisma } from '@feynote/prisma/client';
import type { CoreMessage } from 'ai';

export async function retrieveMessageContext(
  threadId: string,
): Promise<CoreMessage[]> {
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
    (message) => message.json as unknown as CoreMessage,
  );
  return context;
}
