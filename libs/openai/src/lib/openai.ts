import { config } from '@dnd-assistant/api-services';
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});
