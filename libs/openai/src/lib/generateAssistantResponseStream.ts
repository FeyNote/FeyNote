import {
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/chat/completions';
import { openai } from './openai';
import { getDocumentContent } from './tools/getDocumentContent';
import { retrieveMessageContext } from './retrieveMessageContext';
import { OpenAIModel } from './utils/openAIModels';

export async function generateAssistantResponseStream(
  systemMessage: ChatCompletionSystemMessageParam,
  message: string,
  threadId: string,
  model: OpenAIModel,
) {
  const previousMessages = await retrieveMessageContext(threadId);
  const userMessage = {
    content: message,
    role: 'user',
  } satisfies ChatCompletionUserMessageParam;
  const messages = [systemMessage, ...previousMessages, userMessage];
  const response = openai.beta.chat.completions.runTools({
    model,
    messages,
    stream: true,
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate5eMonster',
          description: 'A function used to generate a DND 5e Monster',
          parameters: {
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
                  senses: {
                    type: 'string',
                    description:
                      'The range and type of any abnormal senses along with the passive perception score of the generated monster',
                  },
                  languages: {
                    type: 'string',
                    description:
                      'The spoken languages of the generated monster',
                  },
                  cr: {
                    type: 'string',
                    description:
                      'The Challenge Rating of the generated monster',
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
              abilities: {
                type: 'object',
                properties: {
                  skills: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description:
                      'Any skill proficiencies of the generated monster',
                  },
                  savingThrows: {
                    type: 'object',
                    properties: {
                      strength: {
                        type: 'string',
                        description: 'Strength saving throw bonus',
                      },
                      dexterity: {
                        type: 'string',
                        description: 'Dexterity saving throw bonus',
                      },
                      constitution: {
                        type: 'string',
                        description: 'Constitution saving throw bonus',
                      },
                      intelligence: {
                        type: 'string',
                        description: 'Intelligence saving throw bonus',
                      },
                      wisdom: {
                        type: 'string',
                        description: 'Wisdom saving throw bonus',
                      },
                      charisma: {
                        type: 'string',
                        description: 'Charisma saving throw bonus',
                      },
                    },
                    description:
                      'Any saving throw bonuses of the generated monster',
                  },
                  damageResistances: {
                    type: 'string',
                    description:
                      'Any damage resistances of the generated monster',
                  },
                  damageImmunities: {
                    type: 'string',
                    description:
                      'Any damage immunities of the generated monster',
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
                },
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
                    description: {
                      type: 'string',
                      description: 'The description of the action',
                    },
                    attackBonus: {
                      type: 'string',
                      description:
                        'The attack bonus of the action, if applicable',
                    },
                    damage: {
                      type: 'string',
                      description:
                        'The damage and damage type of the action, if applicable',
                    },
                  },
                },
                description:
                  'The actions that the monster can take on its turn',
              },
              legendaryActions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the legendary action',
                    },
                    description: {
                      type: 'string',
                      description: 'The description of the legendary action',
                    },
                    attackBonus: {
                      type: 'string',
                      description:
                        'The attack bonus of the legendary action, if applicable',
                    },
                    damage: {
                      type: 'string',
                      description:
                        'The damage and damage type of the legendary action, if applicable',
                    },
                  },
                },
                description: 'The legendary actions that the monster can take',
              },
              specialAbilities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the special ability',
                    },
                    description: {
                      type: 'string',
                      description: 'The description of the special ability',
                    },
                  },
                },
                description: 'Any special abilities the monster has',
              },
            },
          },
        },
      },
    ],
  });

  return response;
}
