import { z } from 'zod';
import { tool } from 'ai';

export const Generate5eMonsterSchema = z.object({
  header: z.object({
    name: z.string().describe('The name of the generated monster'),
    alignment: z.string().describe('The allignment of the generated monster'),
  }),
  general: z.object({
    armorClass: z.string().describe('The Armor Class of the generated monster'),
    hitPoints: z.string().describe('The Hit Points of the generated monster'),
    speed: z.string().describe('The Hit Points of the generated monster'),
  }),
  stats: z.object({
    str: z
      .string()
      .describe(
        'The Strength score of the monster generated, followed by their modifier in parathesis',
      ),
    dex: z
      .string()
      .describe(
        'The Dexterity score of the monster generated, followed by their modifier in parathesis',
      ),
    con: z
      .string()
      .describe(
        'The Constitution score of the monster generated, followed by their modifier in parathesis',
      ),
    int: z
      .string()
      .describe(
        'The Intelligence score of the monster generated, followed by their modifier in parathesis',
      ),
    wis: z
      .string()
      .describe(
        'The Wisdom score of the monster generated, followed by their modifier in parathesis',
      ),
    cha: z
      .string()
      .describe(
        'The Charisma score of the monster generated, followed by their modifier in parathesis',
      ),
  }),
  attributes: z.object({
    skills: z
      .string()
      .optional()
      .describe('Skills or proficiencies of the generated monster'),
    savingThows: z
      .string()
      .optional()
      .describe('Saving throw checks the monsters may have'),
    damageResistances: z
      .string()
      .optional()
      .describe('Any damage resistances of the generated monster'),
    damageImmunities: z
      .string()
      .optional()
      .describe('Any damage immunities of the generated monster'),
    conditionImmunities: z
      .string()
      .optional()
      .describe('Any condition immunities of the generated monster'),
    damageVulnerabilities: z
      .string()
      .optional()
      .describe('Any damage vulnerabilities of the generated monster'),
    senses: z
      .string()
      .describe(
        'The range and type of any abnormal senses along with the passive perception score of the generated monster',
      ),
    languages: z
      .string()
      .describe('The spoken languages of the generated monster'),
    challenge: z
      .string()
      .describe(
        'The Challenge Rating of the generated monster followed by the XP gained in parathensis for defeating it',
      ),
  }),
  abilities: z
    .array(
      z.object({
        name: z.string().describe('The name of the ability'),
        frequency: z
          .string()
          .optional()
          .describe(
            'Special rules regarding when or under what conditions the monster can use this ability',
          ),
        description: z.string().describe('The description of the ability'),
      }),
    )
    .optional()
    .describe('Abilities that the monster can perform'),
  actions: z
    .array(
      z.object({
        name: z.string().describe('The name of the action'),
        frequency: z
          .string()
          .optional()
          .describe(
            'Special rules regarding the frequency the monster can take this action',
          ),
        description: z.string().describe('The description of the action'),
      }),
    )
    .optional()
    .describe('The actions that the monster can take on its turn'),
  reactions: z
    .array(
      z.object({
        name: z.string().describe('The name of the reaction'),
        description: z.string().describe('The description of the reaction'),
      }),
    )
    .optional()
    .describe(
      'Any reactions the monster may make during the reaction phase of its turn',
    ),
  legendaryActions: z
    .object({
      ruleset: z
        .string()
        .describe(
          'The ruleset regarding the legendary actions for this creature',
        ),
      actions: z
        .array(
          z.object({
            name: z.string().describe('The name of the action'),
            cost: z
              .string()
              .optional()
              .describe(
                'Any cost that should be stated outside of the usual action cost',
              ),
            description: z
              .string()
              .describe('The description of the legendary action'),
          }),
        )
        .describe('The legendary actions this monster may have'),
    })
    .optional()
    .describe(
      'Very rarily some monsters may have legendary actions that will be described here',
    ),
});

export type Generate5eMonsterParams = z.infer<typeof Generate5eMonsterSchema>;

export const Generate5eMonsterTool = tool({
  description:
    'A function that generates and displays a DND 5e Monster to the user',
  parameters: Generate5eMonsterSchema,
  execute: async (generatedMonster: Generate5eMonsterParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT NEEDLESSLY
    ---
    ${generatedMonster}
    --
    `;
  },
});
