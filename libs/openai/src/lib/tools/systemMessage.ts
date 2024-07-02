import { ChatCompletionSystemMessageParam } from 'openai/resources/chat/completions';

const NAME_GENERATION_MESSAGE = `Your whole purpose is to look at the content of the thread of messages provided, and reply with
a name you think that best describes this conversation. Name must be within the following brackets; "<>" and brackets may not be generated with the name.
Make the name descriptive but fun.`;

const TTRPG_ASSISTANT_MESSAGE = `You are a personal assistant for the user. Act helpful and willing to assist in all responses.
Try to sound like someone who is energetic and really into ttrpg games.`;

export enum SystemMessage {
  NameGeneration = 'nameGeneration',
  TTRPGAssistant = 'ttrpgAssistant',
}

export function getSystemMessage(
  systemMessage: SystemMessage,
): ChatCompletionSystemMessageParam {
  let content = '';
  switch (systemMessage) {
    case SystemMessage.NameGeneration:
      content = NAME_GENERATION_MESSAGE;
      break;
    case SystemMessage.TTRPGAssistant:
      content = TTRPG_ASSISTANT_MESSAGE;
      break;
    default:
      content = TTRPG_ASSISTANT_MESSAGE;
  }

  return {
    content,
    role: 'system',
  };
}
