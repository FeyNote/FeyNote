import {
  Generate5eMonsterParams,
  getGenerate5eMonsterSchema,
  type Generate5eMonsterTool,
} from '@feynote/shared-utils';
import { tool, type InferUITool } from 'ai';

export const generate5eMonsterTool = tool({
  description:
    'A function that generates and displays a DND 5e Monster to the user',
  inputSchema: getGenerate5eMonsterSchema(),
  execute: async (_: Generate5eMonsterParams) => {
    return '';
  },
});

type _Display5eMonsterTool = InferUITool<typeof generate5eMonsterTool>;

const _ = {} as _Display5eMonsterTool satisfies Generate5eMonsterTool;
const __ = {} as Generate5eMonsterTool satisfies _Display5eMonsterTool;
