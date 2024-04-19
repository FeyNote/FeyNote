import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { message, MessageSchema } from '@dnd-assistant/openai';

export const sendMessage = authenticatedProcedure
  .input(
    z.object({
      messages: MessageSchema.array().min(1),
    })
  )
  .query(async ({ input }) => {
    const response = await message(input.messages);
    return response.choices[0].message;
  });
