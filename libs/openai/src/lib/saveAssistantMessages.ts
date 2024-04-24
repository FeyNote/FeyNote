import { prisma } from '@feynote/prisma/client';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export async function saveAssistantMessages(
  messages: ChatCompletionMessageParam[],
  threadId: string,
) {
  const createdAt = new Date();
  const prismaMessages = messages.map((message, i) => {
    let content: string;
    if (!message.content) {
      content = '';
    } else if (typeof message.content === 'string') {
      content = message.content || '';
    } else {
      content = message.content
        .map((part) => {
          if (part.type === 'image_url') {
            return part.image_url;
          }
          if (part.type === 'text') {
            return part.text;
          }
          throw new Error(
            `Invalid type in ChatCompletionContentPart: ${(part as any).type}`,
          );
        })
        .join('\n');
    }
    return {
      content,
      role: message.role,
      json: message as any,
      threadId,
      createdAt: new Date(createdAt.getTime() + i),
    };
  });
  await prisma.message.createMany({
    data: prismaMessages,
  });
}
