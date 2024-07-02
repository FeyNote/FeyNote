import { ChatCompletionUserMessageParam } from 'openai/resources/chat/completions';
import { openai } from './openai';
import { getDocumentContent } from './tools/getDocumentContent';
import { retrieveMessageContext } from './retrieveMessageContext';
import { getSystemMessage, SystemMessage } from './tools/systemMessage';
import { getOpenAIModel } from './tools/getOpenAIModel';

export async function getAssistantMessageStream(
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

  return response;
}
