import type { Message } from 'ai';

export interface ThreadDTOMessage {
  id: string;
  json: Message;
}

export interface ThreadDTO {
  id: string;
  title?: string;
  messages: ThreadDTOMessage[];
}
