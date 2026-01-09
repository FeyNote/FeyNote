import {
  Generate5eObjectParams,
  getGenerate5eObjectSchema,
  type Generate5eObjectTool,
} from '@feynote/shared-utils';
import { tool, type InferUITool } from 'ai';

export const generate5eObjectTool = tool({
  description:
    'A function that generates and displays a DND 5e item or spell to the user',
  inputSchema: getGenerate5eObjectSchema(),
  strict: true,
  execute: async (generatedObject: Generate5eObjectParams) => {
    return `
    ---
    ${generatedObject}
    --
    THE ABOVE INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT IT
    `;
  },
});

type _Generate5eObjectTool = InferUITool<typeof generate5eObjectTool>;

const _ = {} as _Generate5eObjectTool satisfies Generate5eObjectTool;
const __ = {} as Generate5eObjectTool satisfies _Generate5eObjectTool;
