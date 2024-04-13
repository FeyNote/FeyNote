import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { message } from '@dnd-assistant/openai';

export const sendMessage = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const response = await message(ctx.session.userId, input.query);
    return response.choices[0].message;
  });
