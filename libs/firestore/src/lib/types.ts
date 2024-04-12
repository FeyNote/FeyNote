export enum Collection {
  Messages = 'messages',
}

export interface MessageCollectionSchema {
  id: string;
  userId: string;
  messages: Message[],
}

interface Message {
  role: MessageRoles;
  content: string;
}

export enum MessageRoles {
  System = 'system',
  User = 'user',
  Assistant= 'assistant',
}
