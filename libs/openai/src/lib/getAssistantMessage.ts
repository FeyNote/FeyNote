import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { getDocumentContent } from './tools/getDocumentContent';
import { retrieveMessageContext } from './retrieveMessageContext';
import { getSystemMessage, SystemMessage } from './tools/systemMessage';
import { getOpenAIModel } from './tools/getOpenAIModel';

export async function getAssistantMessage(
  systemMessage: SystemMessage,
  message: string,
  threadId: string,
  userId: string,
) {
  const _systemMessage = getSystemMessage(systemMessage);
  const previousMessages = await retrieveMessageContext(threadId);
  const userMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const messages = [_systemMessage, ...previousMessages, userMessage];
  const model = getOpenAIModel(userId);
  const response = openai.beta.chat.completions.runTools({
    model,
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

function getRecentResponseMessages(messages: ChatCompletionMessageParam[]) {
  if (!messages.length) return [];
  const responseMessages = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === 'assistant' && message.content) {
      responseMessages.push(message);
    } else if (message.role === 'user') {
      break;
    }
  }
  return responseMessages;
}
