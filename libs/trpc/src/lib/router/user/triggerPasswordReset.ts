import { publicProcedure } from '../../trpc';
import { z } from 'zod';
import * as services from '@dnd-assistant/api-services';

export const triggerPasswordReset = publicProcedure
  .input(
    z.object({
      email: z.string(),
      returnUrl: z.string(),
    })
  )
  .mutation(({ input }) => {
    return services.triggerPasswordReset(input.email, input.returnUrl);
  });
