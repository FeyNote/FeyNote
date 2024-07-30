import { prisma } from '@feynote/prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { assertJsonIsChatCompletion } from './tools/assertJsonIsChatCompletion';

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

  const context = messages
    .filter((message) => {
      try {
        assertJsonIsChatCompletion(message.json);
      } catch (e) {
        // Ignore Messages that don't match Chat Completion Schema
        return false;
      }
      return true;
    })
    .map((message) => message.json as unknown as ChatCompletionMessageParam);
  return context;
}
