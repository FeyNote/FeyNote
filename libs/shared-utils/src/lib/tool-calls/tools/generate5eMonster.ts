import type { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { FunctionName } from '../tiptapToolCallBuilder';

export interface Generated5eMonster {
  header: {
    name: string;
    allignment: string;
  };
  general: {
    ac: string;
    hp: string;
    speed: string;
  };
  stats: {
    strength: string;
    dexterity: string;
    constitution: string;
    intelligence: string;
    wisdom: string;
    charisma: string;
  };
  attributes: {
    skills?: string;
    savingThows?: string;
    damageResistances?: string;
    damageImmunities?: string;
    conditionImmunities?: string;
    damageVulnerabilities?: string;
    senses?: string;
    languages?: string;
    cr: string;
  };
  abilities?: [
    {
      name: string;
      frequency: string;
      description: string;
    },
  ];
  actions: [
    {
      name: string;
      frequency: string;
      description: string;
    },
  ];
  reactions?: [
    {
      name: string;
      description: string;
    },
  ];
  legendaryActions?: {
    ruleset: string;
    actions: [
      {
        name: string;
        cost: string;
        description: string;
      },
    ];
  };
}

export const generate5eMonster =
  (): RunnableToolFunction<Generated5eMonster> => {
    return {
      type: 'function',
      function: {
        name: FunctionName.Generate5eMonster,
        description:
          'A function that generates and displays a DND 5e Monster to the user',
        parse: JSON.parse,
        function: (generatedMonster: Generated5eMonster) => {
          return `
          THE FOLLOWING DATA WILL HAVE ALREADY BEEN SENT TO THE USER, DO NOT REITERATE THE DATA IN YOUR RESPONSE
          ---
          ${JSON.stringify(generatedMonster)}
          ---
        `;
        },
        parameters: {
          required: ['header', 'general', 'stats', 'attributes.cr', 'actions'],
          type: 'object',
          properties: {
            header: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the generated monster',
                },
                allignment: {
                  type: 'string',
                  description: 'The allignment of the generated monster',
                },
              },
            },
            general: {
              type: 'object',
              properties: {
                ac: {
                  type: 'string',
                  description: 'The Armor Class of the generated monster',
                },
                hp: {
                  type: 'string',
                  description: 'The Hit Points of the generated monster',
                },
                speed: {
                  type: 'string',
                  description: 'The movement speed of the generated monster',
                },
              },
            },
            stats: {
              type: 'object',
              properties: {
                strength: {
                  type: 'string',
                  description: 'The Strength score of the monster generated',
                },
                dexterity: {
                  type: 'string',
                  description: 'The Dexterity score of the monster generated',
                },
                constitution: {
                  type: 'string',
                  description:
                    'The Constitution score of the monster generated',
                },
                intelligence: {
                  type: 'string',
                  description:
                    'The Intelligence score of the monster generated',
                },
                wisdom: {
                  type: 'string',
                  description: 'The Wisdom score of the monster generated',
                },
                charisma: {
                  type: 'string',
                  description: 'The Charisma score of the monster generated',
                },
              },
            },
            attributes: {
              type: 'object',
              properties: {
                skills: {
                  type: 'string',
                  description:
                    'Skills or proficiencies of the generated monster',
                },
                savingThrows: {
                  type: 'string',
                  description:
                    'Bonuses to specific saving throw checks the monsters may have',
                },
                senses: {
                  type: 'string',
                  description:
                    'The range and type of any abnormal senses along with the passive perception score of the generated monster',
                },
                languages: {
                  type: 'string',
                  description: 'The spoken languages of the generated monster',
                },
                damageResistances: {
                  type: 'string',
                  description:
                    'Any damage resistances of the generated monster',
                },
                damageImmunities: {
                  type: 'string',
                  description: 'Any damage immunities of the generated monster',
                },
                conditionImmunities: {
                  type: 'string',
                  description:
                    'Any condition immunities of the generated monster',
                },
                damageVulnerabilities: {
                  type: 'string',
                  description:
                    'Any damage vulnerabilities of the generated monster',
                },
                cr: {
                  type: 'string',
                  description: 'The Challenge Rating of the generated monster',
                },
              },
            },
            abilities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the ability',
                  },
                  frequency: {
                    type: 'string',
                    description:
                      'Special rules regarding when or under what conditions the monster can use this ability',
                  },
                  description: {
                    type: 'string',
                    description: 'The description of the ability',
                  },
                },
              },
              description: 'The abilities that the monster can perform',
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the action',
                  },
                  frequency: {
                    type: 'string',
                    description:
                      'Special rules regarding the frequency the monster can take this action',
                  },
                  description: {
                    type: 'string',
                    description: 'The description of the action',
                  },
                },
              },
              description: 'The actions that the monster can take on its turn',
            },
            reactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'The name of the reaction',
                  },
                  description: {
                    type: 'string',
                    description: 'The description of the ability',
                  },
                },
              },
              description: 'Any special reactions the monster may have',
            },
            legendaryActions: {
              type: 'object',
              properties: {
                ruleset: {
                  type: 'string',
                  description:
                    'The ruleset regarding the legendary actions for this creature',
                },
                actions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'The name of the legendary action',
                      },
                      cost: {
                        type: 'string',
                        description:
                          'The cost in actions it takes to perform this legendary action',
                      },
                      description: {
                        type: 'string',
                        description: 'The description of the legendary action',
                      },
                    },
                  },
                  description: 'The list of legendary actions',
                },
              },
              description: 'The legendary actions block this monster may have',
            },
          },
        },
      },
    };
  };
