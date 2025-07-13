import { prisma } from '@feynote/prisma/client';

export async function getNumOfMessagesSentInWindow(
  userId: string,
  createdFrom: Date,
): Promise<number> {
  const numOfMessages = await prisma.message.count({
    where: {
      thread: {
        userId,
      },
      createdAt: {
        gte: createdFrom,
      },
    },
  });
  return numOfMessages;
}
