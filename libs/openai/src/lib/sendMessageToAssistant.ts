import {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { prisma } from '@feynote/prisma/client';
import { z } from 'zod';

const OPEN_AI_MODEL = 'gpt-3.5-turbo';

function getSystemMessage(): ChatCompletionSystemMessageParam {
  return {
    content: `You are a personal assistant for the user. Act helpful and willing to assist in all responses.
    Try to sound like someone who is energetic and really into ttrpg games.`,
    role: 'system',
  };
}

async function retrieveMessageContext(
  threadId: string,
): Promise<ChatCompletionMessageParam[]> {
  const messages = await prisma.message.findMany({
    where: { id: threadId },
    take: 20,
    orderBy: {
      createdAt: 'desc',
    },
  });
  const context = messages.map((message) => {
    const json = message.json;
    assertMessageJsonIsChatCompletion(json);
    return json;
  });
  return context;
}

function assertMessageJsonIsChatCompletion(
  json: unknown,
): asserts json is ChatCompletionMessageParam {
  const jsonSchema = z.object({
    role: z.enum(['assistant', 'user', 'system', 'function', 'tool']),
  });
  jsonSchema.parse(json);
}

export async function sendMessageToAssistant(
  message: string,
  threadId: string,
) {
  const messages = await retrieveMessageContext(threadId);
  const newMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const systemMessage = getSystemMessage();

  const response = openai.beta.chat.completions.runTools({
    model: OPEN_AI_MODEL,
    messages: [systemMessage, ...messages, newMessage],
    tools: [],
  });

  await response.done();
  return [newMessage, ...response.messages];
}
