import type { UIDataTypes, UIMessagePart } from 'ai';
import { z, infer as zInfer } from 'zod';
import type { FeynoteUITool } from '../FeynoteUIMessage';

export const getDisplayScrapeUrlSchema = () => {
  return z.object({
    url: z.string().describe('The url the user posted'),
  });
};

export type ScrapeUrlParams = zInfer<
  ReturnType<typeof getDisplayScrapeUrlSchema>
>;

export type DisplayUrlTool = {
  input: ScrapeUrlParams;
  output: UIMessagePart<UIDataTypes, FeynoteUITool>[] | null;
};
