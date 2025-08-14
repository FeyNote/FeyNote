import type { Tool, TypedToolResult } from 'ai';
import { z, infer as zInfer } from 'zod';

export const getDisplayScrapeUrlSchema = () => {
  return z.object({
    url: z.string().describe('The url the user posted'),
  });
};

export type ScrapeUrlParams = zInfer<
  ReturnType<typeof getDisplayScrapeUrlSchema>
>;

export type DisplayUrlTool = {
  input: ScrapeUrlParams,
  output: {
    text: string;
    toolInvocations: TypedToolResult<Record<string, Tool>>[]
  } | null
}
