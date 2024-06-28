import { globalServerConfig } from '@feynote/config';
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: globalServerConfig.openai.apiKey,
});
