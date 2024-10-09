import {
  Generate5eMonsterParams,
  get5eMonsterSchema,
} from '@feynote/shared-utils';
import { tool } from 'ai';

export const Generate5eMonsterTool = tool({
  description:
    'A function that generates and displays a DND 5e Monster to the user',
  parameters: get5eMonsterSchema(),
  execute: async (generatedMonster: Generate5eMonsterParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT NEEDLESSLY
    ---
    ${generatedMonster}
    --
    `;
  },
});
