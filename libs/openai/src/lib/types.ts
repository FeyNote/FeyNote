export interface Message {
  role: MessageRoles;
  content: string;
}

export enum MessageRoles {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
}
