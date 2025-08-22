import type { UIDataTypes, UIMessagePart } from 'ai';
import { z, infer as zInfer } from 'zod';
import type { FeynoteUITool } from '../FeynoteUIMessage';

export const getScrapeUrlSchema = () => {
  return z.object({
    url: z.string().describe('The url the user posted'),
  });
};

export type ScrapeUrlParams = zInfer<ReturnType<typeof getScrapeUrlSchema>>;

export type ScrapeUrlTool = {
  input: ScrapeUrlParams;
  output: UIMessagePart<UIDataTypes, FeynoteUITool>[] | null;
};
