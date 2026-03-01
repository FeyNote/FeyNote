import { z, infer as zInfer } from 'zod';

export const getGenerateTableSchema = () => {
  return z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  });
};

export type GenerateTableParams = zInfer<
  ReturnType<typeof getGenerateTableSchema>
>;
