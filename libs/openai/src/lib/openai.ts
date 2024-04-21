import { config } from '@feynote/api-services';
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});
