import { z } from 'zod';

export enum MessageRoles {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
}

export const MessageSchema = z.object({
  content: z.string(),
  role: z.nativeEnum(MessageRoles),
});

export type Message = z.infer<typeof MessageSchema>;
