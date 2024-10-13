import {
  Generate5eObjectParams,
  getDisplay5eObjectSchema,
} from '@feynote/shared-utils';
import { tool } from 'ai';

export const Display5eObjectTool = tool({
  description:
    'A function that generates and displays a DND 5e object to the user',
  parameters: getDisplay5eObjectSchema(),
  execute: async (generatedObject: Generate5eObjectParams) => {
    return `
    ---
    ${generatedObject}
    --
    THE ABOVE INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT IT
    `;
  },
});
