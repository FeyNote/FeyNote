import { z, infer as zInfer } from 'zod';

export const getDisplay5eObjectSchema = () => {
  return z.object({
    name: z.string().describe('The name of the generated object'),
    subheader: z
      .string()
      .describe(`The subheader/descriptor of the generated object"`),
    keyPairs: z
      .array(
        z.object({
          keyName: z
            .string()
            .describe(
              'The bolded name of the text that will appear to the user',
            ),
          keyValue: z
            .string()
            .describe('The value associated with the generated text key'),
        }),
      )
      .describe(
        'Some 5e objects come with required key value properties, this is the list that will contain those',
      )
      .nullable(),
    descriptions: z
      .array(z.string())
      .describe('The descriptive text of the object')
      .nullable(),
  });
};

export type Generate5eObjectParams = zInfer<
  ReturnType<typeof getDisplay5eObjectSchema>
>;

export type Display5eObjectTool = {
  input: Generate5eObjectParams,
  output: string,
}
