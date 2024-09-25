import { z } from 'zod';
import { tool } from 'ai';

const Generate5eObjectSchema = z.object({
  name: z.string().describe('The name of the generated object'),
  subheader: z
    .string()
    .describe(`The subheader/descriptor of the generated object"`),
  keyPairs: z
    .array(
      z.object({
        keyName: z
          .string()
          .describe('The bolded name of the text that will appear to the user'),
        keyValue: z
          .string()
          .describe('The value associated with the generated text key'),
      }),
    )
    .describe(
      'Many 5e objects come with required key value properties, this is the list that will contain those',
    ),
  description: z
    .string()
    .describe(
      'The generated description or paragraph text needed to generated for this object',
    )
    .optional(),
});

export type Generate5eObjectParams = z.infer<typeof Generate5eObjectSchema>;

export const Generate5eObjectTool = tool({
  description:
    'A function that generates and displays a DND 5e object to the user',
  parameters: Generate5eObjectSchema,
  execute: async (generatedObject: Generate5eObjectParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT NEEDLESSLY
    ---
    ${generatedObject}
    --
    `;
  },
});
