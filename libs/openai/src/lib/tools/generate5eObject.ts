import {
  Generate5eObjectParams,
  get5eObjectSchema,
} from '@feynote/shared-utils';
import { tool } from 'ai';

export const Generate5eObjectTool = tool({
  description:
    'A function that generates and displays a DND 5e object to the user',
  parameters: get5eObjectSchema(),
  execute: async (generatedObject: Generate5eObjectParams) => {
    return `
    THE BELOW INFORMATION HAS ALREADY BEEN SHOW TO THE USER DO NOT REPEAT IT
    ---
    ${generatedObject}
    --
    `;
  },
});
