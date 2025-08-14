import {
  Generate5eObjectParams,
  getDisplay5eObjectSchema,
  type Display5eObjectTool,
} from '@feynote/shared-utils';
import { tool, type InferUITool } from 'ai';

export const display5eObjectTool = tool({
  description:
    'A function that generates and displays a DND 5e item or spell to the user',
  inputSchema: getDisplay5eObjectSchema(),
  execute: async (generatedObject: Generate5eObjectParams) => {
    return `
    ---
    ${generatedObject}
    --
    THE ABOVE INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT IT
    `;
  },
});

type _Display5eObjectTool = InferUITool<typeof display5eObjectTool>;

const _ = {} as _Display5eObjectTool satisfies Display5eObjectTool;
const __ = {} as Display5eObjectTool satisfies _Display5eObjectTool;
