import { Message } from "openai/resources/beta/threads/messages/messages";
import { openai } from "./openai";
import { OpenAiRoles } from "./types";

const OPEN_AI_MODEL = 'gpt-3.5-turbo';

const getMessagesFromFirestore = async (threadId: string): Promise<Message[]> => {
  const messageObj = await
  return messages
};

export const message = async (threadId: string, query: string) => {
  const messages = [];
  const previousMessages = await getMessagesFromThread(threadId);

  if (!previousMessages) {
    const systemMessage = await getSystemMessage();
    messages.push(systemMessage);
  } else {
    messages.push(...previousMessages);
  }

  messages.push({
    role: OpenAiRoles.User,
    content: query
  })

  const response = await openai.chat.completions.create({
    model: OPEN_AI_MODEL,
    messages,
  });

  return response;
};

// Collection Messages
{
  _id: 'xxx',// thread-id
  userId: 'yyy', //user-id
  messages: [
    {
      role: 'system',
      type: 'text',
      context: 'You are a ttrpg assistant'
    },
    ...
  ]
}



