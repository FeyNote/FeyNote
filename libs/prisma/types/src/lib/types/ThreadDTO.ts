import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface ThreadDTOMessage {
  id: string;
  json: ChatCompletionMessageParam;
}

export interface ThreadDTO {
  id: string;
  title?: string;
  messages: ThreadDTOMessage[];
}
