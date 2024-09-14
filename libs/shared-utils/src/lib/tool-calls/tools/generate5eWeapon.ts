import { z } from 'zod';
import { tool } from 'ai';

const Generate5eWeaponSchema = z.object({
  name: z.string().describe('The name of the generated weapon'),
  subtitle: z
    .string()
    .describe(`The weapon subtitle i.e. "melee weapon (martial, sword)"`),
  category: z.string().describe('The category the weapon belongs too'),
  damage: z.string().describe(`The damage of the weapon, i.e. 1d8`),
  damageType: z.string().describe(`The type of damage, i.e. "Slashing"`),
  rarity: z.string().describe('The rarity of the weapon'),
  properties: z
    .string()
    .describe(`The properties of the weapon, i.e. "Versatile, Range, Loading"`),
  weight: z.string().describe('The weight of the weapon'),
  descriptionBlocks: z
    .array(
      z
        .string()
        .describe('Nicely formed paragraph about the weapon and its effects'),
    )
    .describe(
      'Any needed special description of what this weapon does and its effects',
    )
    .optional(),
});

export type Generate5eWeaponParams = z.infer<typeof Generate5eWeaponSchema>;

export const Generate5eWeaponTool = tool({
  description:
    'A function that generates and displays a DND 5e Spell to the user',
  parameters: Generate5eWeaponSchema,
  execute: async (generatedItem: Generate5eWeaponParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT NEEDLESSLY
    ---
    ${generatedItem}
    --
    `;
  },
});
