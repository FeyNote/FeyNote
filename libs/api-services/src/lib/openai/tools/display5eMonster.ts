import {
  Generate5eMonsterParams,
  getDisplay5eMonsterSchema,
} from '@feynote/shared-utils';
import { tool } from 'ai';

export const Display5eMonsterTool = tool({
  description:
    'A function that generates and displays a DND 5e Monster to the user',
  inputSchema: getDisplay5eMonsterSchema(),
  execute: async (_: Generate5eMonsterParams) => {
    return '';
  },
});
