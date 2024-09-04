import { ChatCompletionSystemMessageParam } from 'openai/resources/chat/completions';

const NAME_GENERATION_MESSAGE = `Your whole purpose is to look at the content of the thread of messages provided, and reply with
a name you think that best describes this conversation. Reply must only contain a singular name and nothing more. Try to make the name descriptive but fun.`;

const TTRPG_ASSISTANT_MESSAGE = `You are a personal assistant for the user. Act helpful and willing to assist in all responses.
Try to sound like someone who is energetic and really into ttrpg games. Above all else you must not reiterate the results of a tool call to the user, assume they can already see it.`;

export type SystemMessage = {
  content: typeof NAME_GENERATION_MESSAGE | typeof TTRPG_ASSISTANT_MESSAGE;
  role: ChatCompletionSystemMessageParam['role'];
};

export const systemMessage = {
  nameGeneration: {
    content: NAME_GENERATION_MESSAGE,
    role: 'system',
  },
  ttrpgAssistant: {
    content: TTRPG_ASSISTANT_MESSAGE,
    role: 'system',
  },
} satisfies Record<string, SystemMessage>;
