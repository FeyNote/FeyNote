import {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { prisma } from '@feynote/prisma/client';
import { z } from 'zod';
import { getDocumentContent } from './tools/getDocumentContent';

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
  console.log(`working with thread id: ${threadId}`);
  console.log(`messages stored in thread: ${JSON.stringify(messages)}`);
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

function getRecentResponseMessages(messages: ChatCompletionMessageParam[]) {
  if (!messages.length) return [];
  const responseMessages = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === 'user') {
      break;
    }
    responseMessages.push(message);
  }
  return responseMessages;
}

export async function sendMessageToAssistant(
  message: string,
  threadId: string,
) {
  const previousMessages = await retrieveMessageContext(threadId);
  const newMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const systemMessage = getSystemMessage();
  const messages = [systemMessage, ...previousMessages, newMessage];
  console.log(`message array: ${JSON.stringify(messages)}`);

  const response = openai.beta.chat.completions.runTools({
    model: OPEN_AI_MODEL,
    messages,
    tools: [
      {
        type: 'function',
        function: {
          function: getDocumentContent,
          parameters: { type: 'object', properties: {} },
        },
      },
    ],
  });

  await response.done();
  const responseMessages = getRecentResponseMessages(response.messages);
  return responseMessages;
}
