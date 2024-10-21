import { z, infer as zInfer } from 'zod';

export const getDisplay5eMonsterSchema = () => {
  return z.object({
    name: z.string(),
    alignment: z.string(),
    ac: z.string(),
    hp: z.string(),
    speed: z.string(),
    str: z.string(),
    dex: z.string(),
    con: z.string(),
    int: z.string(),
    wis: z.string(),
    cha: z.string(),
    skills: z.string().nullable(),
    savingThows: z.string().nullable(),
    damageResistances: z.string().nullable(),
    damageImmunities: z.string().nullable(),
    conditionImmunities: z.string().nullable(),
    damageVulnerabilities: z.string().nullable(),
    senses: z.string(),
    languages: z.union([z.string(), z.literal('--')]),
    challenge: z
      .string()
      .describe(
        'The Challenge Rating of the generated monster followed by the XP gained in parathensis for defeating it',
      ),
    traits: z.array(
      z.object({
        name: z.string(),
        frequency: z.string().nullable(),
        description: z.string(),
      }),
    ),
    actions: z
      .array(
        z.object({
          name: z.string(),
          frequency: z.string().nullable(),
          description: z.string(),
        }),
      )
      .nullable(),
    reactions: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      )
      .nullable(),
    legendaryActions: z
      .object({
        ruleset: z.string(),
        actions: z.array(
          z.object({
            name: z.string(),
            frequency: z.string().nullable(),
            description: z.string(),
          }),
        ),
      })
      .nullable(),
  });
};

export type Generate5eMonsterParams = zInfer<
  ReturnType<typeof getDisplay5eMonsterSchema>
>;
