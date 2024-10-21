import {
  Generate5eMonsterParams,
  getDisplay5eMonsterSchema,
} from '@feynote/shared-utils';
import { tool } from 'ai';

export const Display5eMonsterTool = tool({
  description:
    'A function that generates and displays a DND 5e Monster to the user',
  parameters: getDisplay5eMonsterSchema(),
  execute: async (generatedMonster: Generate5eMonsterParams) => {
    return `
    ---
    ${generatedMonster}
    --
    DO NOT REPEAT ANY OF THE ABOVE MONSTER DETAILS, THEY HAVE ALREADY BEEN DISPLAYED TO THE USER
    `;
  },
});
