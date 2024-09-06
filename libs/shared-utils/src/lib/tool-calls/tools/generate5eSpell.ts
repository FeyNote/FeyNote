import { z } from 'zod';
import { tool } from 'ai';

const Generate5eSpellSchema = z.object({
  name: z.string().describe('The name of the generated item'),
  level: z.string().describe('The spell level'),
  school: z.string().describe('The spell school'),
  castingTime: z.string().describe('The time it takes to cast the spell'),
  range: z.string().describe('The time it takes to cast the spell'),
  components: z.string().describe('The time it takes to cast the spell'),
  duration: z.string().describe('The time it takes to cast the spell'),
  description: z.string().describe('The time it takes to cast the spell'),
});

export type Generate5eSpellParams = z.infer<typeof Generate5eSpellSchema>;

export const Generate5eSpellTool = tool({
  description:
    'A function that generates and displays a DND 5e Spell to the user',
  parameters: Generate5eSpellSchema,
  execute: async (generatedItem: Generate5eSpellParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT NEEDLESSLY
    ---
    ${generatedItem}
    --
    `;
  },
});
