import { z } from 'zod';
import { tool } from 'ai';

const Generate5eItemSchema = z.object({
  header: z.object({
    name: z.string().describe('The name of the generated item'),
    type: z.string().describe('What type the item is classified as'),
    rarity: z.string().describe('The rarity of the item'),
    attunement: z
      .string()
      .describe(
        `Mentioned if the item requires attunement by certain classes, i.e. "requires attunement by a Cleric, Druid, or Warlock"`,
      )
      .optional(),
  }),
  descriptionBlocks: z
    .array(
      z
        .string()
        .describe('Nicely formed paragraph of the item and its effects'),
    )
    .describe('The description of what this item does alongside its effects'),
});

export type Generate5eItemParams = z.infer<typeof Generate5eItemSchema>;

export const Generate5eItemTool = tool({
  description:
    'A function that generates and displays a DND 5e Item to the user',
  parameters: Generate5eItemSchema,
  execute: async (generatedItem: Generate5eItemParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT NEEDLESSLY
    ---
    ${generatedItem}
    --
    `;
  },
});
