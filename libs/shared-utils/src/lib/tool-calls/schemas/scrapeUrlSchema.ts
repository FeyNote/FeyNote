import { z, infer as zInfer } from 'zod';

export const getScrapeUrlSchema = () => {
  return z.object({
    url: z.string().describe('The url the user posted'),
  });
};

export type ScrapeUrlParams = zInfer<ReturnType<typeof getScrapeUrlSchema>>;
