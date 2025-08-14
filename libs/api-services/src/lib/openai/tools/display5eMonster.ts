import {
  Generate5eMonsterParams,
  getDisplay5eMonsterSchema,
  type Display5eMonsterTool,
} from '@feynote/shared-utils';
import { tool, type InferUITool } from 'ai';

export const display5eMonsterTool = tool({
  description:
    'A function that generates and displays a DND 5e Monster to the user',
  inputSchema: getDisplay5eMonsterSchema(),
  execute: async (_: Generate5eMonsterParams) => {
    return '';
  },
});

type _Display5eMonsterTool = InferUITool<typeof display5eMonsterTool>;

const _ = {} as _Display5eMonsterTool satisfies Display5eMonsterTool;
const __ = {} as Display5eMonsterTool satisfies _Display5eMonsterTool;
