import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { openai } from './openai';
import { Message, MessageRoles } from './types';

const OPEN_AI_MODEL = 'gpt-3.5-turbo';

const getSystemMessage = () => {
  return {
    content: `You are a personal assistant for the user. Act helpful and willing to assist in all responses.
    Try to sound like someone who is energetic and really into ttrpg games.`,
    role: MessageRoles.System,
  };
};

const hasSystemMessage = (messages: Message[]) => {
  return messages.find((message) => message.role === MessageRoles.System);
};

export const message = async (messages: Message[]) => {
  if (!hasSystemMessage(messages)) {
    const systemMessage = getSystemMessage();
    messages = [systemMessage, ...messages];
  }

  const response = await openai.chat.completions.create({
    model: OPEN_AI_MODEL,
    messages: messages as ChatCompletionMessageParam[],
  });

  return response;
};
