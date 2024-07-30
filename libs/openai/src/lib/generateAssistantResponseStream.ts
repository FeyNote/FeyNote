import {
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { getDocumentContent } from './tools/getDocumentContent';
import { retrieveMessageContext } from './retrieveMessageContext';
import { OpenAIModel } from './tools/openAIModels';

export async function generateAssistantResponseStream(
  systemMessage: ChatCompletionSystemMessageParam,
  message: string,
  threadId: string,
  model: OpenAIModel,
) {
  const previousMessages = await retrieveMessageContext(threadId);
  const userMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const messages = [systemMessage, ...previousMessages, userMessage];
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
