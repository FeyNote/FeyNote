import { openai } from './openai';
import { Message, MessageRoles } from './types';

const OPEN_AI_MODEL = 'gpt-3.5-turbo';

const getMessagesFromFirestore = async (): Promise<Message[]> => {
  const messages = [getSystemMessage()];
  return new Promise((res) => res(messages));
};

const getSystemMessage = () => {
  return {
    content: `You are a personal assistant for the user. Act helpful and willing to assist in all responses.
    Try to sound like someone who is energetic and really into ttrpg games.`,
    role: MessageRoles.System,
  };
};

export const message = async (threadId: string, query: string) => {
  const messages = [];
  const previousMessages = await getMessagesFromFirestore();

  if (!previousMessages) {
    const systemMessage = getSystemMessage();
    messages.push(systemMessage);
  } else {
    messages.push(...previousMessages);
  }

  messages.push({
    role: MessageRoles.User,
    content: query,
  });

  const response = await openai.chat.completions.create({
    model: OPEN_AI_MODEL,
    messages,
  });

  return response;
};
