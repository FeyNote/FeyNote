import {
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { getDocumentContent } from './tools/getDocumentContent';
import { retrieveMessageContext } from './retrieveMessageContext';

const OPEN_AI_MODEL = 'gpt-3.5-turbo';

function getSystemMessage(): ChatCompletionSystemMessageParam {
  return {
    content: `You are a personal assistant for the user. Act helpful and willing to assist in all responses.
    Try to sound like someone who is energetic and really into ttrpg games.`,
    role: 'system',
  };
}

export async function sendMessageToAssistant(
  message: string,
  threadId: string,
  userId: string,
) {
  const previousMessages = await retrieveMessageContext(threadId, userId);
  const userMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const systemMessage = getSystemMessage();
  const messages = [systemMessage, ...previousMessages, userMessage];
  const stream = openai.beta.chat.completions.runTools({
    model: OPEN_AI_MODEL,
    messages,
    stream: true,
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

  return stream;
}
