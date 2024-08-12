import {
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { retrieveMessageContext } from './retrieveMessageContext';
import { OpenAIModel } from './utils/openAIModels';
import { generate5eMonster } from '@feynote/shared-utils';

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
    tools: [generate5eMonster()],
  });

  return response;
}
