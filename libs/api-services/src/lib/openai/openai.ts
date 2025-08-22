import { globalServerConfig } from '@feynote/config';
import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  apiKey: globalServerConfig.openai.apiKey,
});
