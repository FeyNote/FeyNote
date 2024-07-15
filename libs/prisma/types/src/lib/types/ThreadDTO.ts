import { z } from 'zod';

export const ThreadDTOMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['function', 'tool', 'assistant', 'user']),
  content: z.string(),
});

export const ThreadDTOSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  messages: z.array(ThreadDTOMessageSchema),
});

export type ThreadDTO = z.infer<typeof ThreadDTOSchema>;
