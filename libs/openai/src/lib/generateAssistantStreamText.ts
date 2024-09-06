import { openai } from './openai';
import { AIModel } from './utils/AIModel';
import { streamText, type CoreMessage } from 'ai';
import {
  FunctionName,
  Generate5eItemTool,
  Generate5eSpellTool,
  Generate5eMonsterTool,
  Generate5eWeaponTool,
  Generate5eObjectTool,
} from '@feynote/shared-utils';

const tools = {
  [FunctionName.Generate5eMonster]: Generate5eMonsterTool,
  [FunctionName.Generate5eObject]: Generate5eObjectTool,
  // [FunctionName.Generate5eItem]: Generate5eItemTool,
  // [FunctionName.Generate5eSpell]: Generate5eSpellTool,
  // [FunctionName.Generate5eWeapon]: Generate5eWeaponTool,
};

export async function generateAssistantStreamText(
  messages: CoreMessage[],
  model: AIModel,
): ReturnType<typeof streamText<typeof tools>> {
  const stream = await streamText({
    model: openai(model),
    tools,
    maxTokens: 4096,
    messages,
    experimental_toolCallStreaming: true,
  });
  return stream;
}
