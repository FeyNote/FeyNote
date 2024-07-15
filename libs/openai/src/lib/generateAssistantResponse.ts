import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { getDocumentContent } from './tools/getDocumentContent';
import { retrieveMessageContext } from './retrieveMessageContext';
import { OpenAIModel } from './tools/openAIModels';
import { SystemMessage } from './tools/SystemMessage';

export async function generateAssistantResponse(
  systemMessage: SystemMessage,
  message: string,
  threadId: string,
) {
  const previousMessages = await retrieveMessageContext(threadId);
  const userMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const messages = [systemMessage, ...previousMessages, userMessage];
  const response = openai.beta.chat.completions.runTools({
    model: OpenAIModel.GPT4,
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
