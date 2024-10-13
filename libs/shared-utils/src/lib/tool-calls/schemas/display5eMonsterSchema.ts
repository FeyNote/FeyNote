import { z, infer as zInfer } from 'zod';

export const getDisplay5eMonsterSchema = () => {
  return z.object({
    name: z.string().describe('The name of the generated monster'),
    alignment: z.string().describe('The allignment of the generated monster'),
    ac: z.string().describe('The Armor Class of the generated monster'),
    hp: z.string().describe('The Hit Points of the generated monster'),
    speed: z.string().describe('The Hit Points of the generated monster'),
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
    skills: z
      .string()
      .describe('Skills or proficiencies of the generated monster')
      .nullable(),
    savingThows: z
      .string()
      .describe('Saving throw checks the monsters may have')
      .nullable(),
    damageResistances: z
      .string()
      .describe('Any damage resistances of the generated monster')
      .nullable(),
    damageImmunities: z
      .string()
      .describe('Any damage immunities of the generated monster')
      .nullable(),
    conditionImmunities: z
      .string()
      .describe('Any condition immunities of the generated monster')
      .nullable(),
    damageVulnerabilities: z
      .string()
      .describe('Any damage vulnerabilities of the generated monster')
      .nullable(),
    senses: z
      .string()
      .describe(
        'The range and type of any abnormal senses along with the passive perception score of the generated monster',
      ),
    languages: z
      .union([z.string(), z.literal('--')])
      .describe('The spoken languages of the generated monster'),
    challenge: z
      .string()
      .describe(
        'The Challenge Rating of the generated monster followed by the XP gained in parathensis for defeating it',
      ),
    traits: z
      .array(
        z.object({
          name: z.string().describe('The name of the trait'),
          frequency: z
            .string()
            .nullable()
            .describe(
              'Special rules regarding when or under what conditions the monster can use this trait',
            ),
          description: z.string().describe('The description of the trait'),
        }),
      )
      .describe('Traits that the monster holds'),
    actions: z
      .array(
        z.object({
          name: z.string().describe('The name of the action'),
          frequency: z
            .string()
            .nullable()
            .describe(
              'Special rules regarding the frequency the monster can take this action',
            ),
          description: z.string().describe('The description of the action'),
        }),
      )
      .describe('The actions that the monster can take on its turn')
      .nullable(),
    reactions: z
      .array(
        z.object({
          name: z.string().describe('The name of the reaction'),
          description: z.string().describe('The description of the reaction'),
        }),
      )
      .describe(
        'Any reactions the monster may make during the reaction phase of its turn',
      )
      .nullable(),
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
              frequency: z
                .string()
                .nullable()
                .describe(
                  'The number of times the creature can perform this legendary action',
                ),
              description: z
                .string()
                .describe('The description of the legendary action'),
            }),
          )
          .describe('The legendary actions this monster may have'),
      })
      .describe(
        'Very rarily some monsters may have legendary actions that will be described here',
      )
      .nullable(),
  });
};

export type Generate5eMonsterParams = zInfer<
  ReturnType<typeof getDisplay5eMonsterSchema>
>;
