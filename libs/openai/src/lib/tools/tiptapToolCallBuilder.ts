import type { ChatCompletionMessageToolCall } from 'openai/resources';
import type { Generated5eMonster } from './generateMonster/5e/generate5eMonsterToolDefinition';
import { convert5eMonsterToTipTap } from './generateMonster/5e/convert5eMonsterToTipTap';

export enum FunctionName {
  Generate5eMonster = 'generate5eMonster',
}

interface FunctionNameToToolCallResult {
  [FunctionName.Generate5eMonster]: Generated5eMonster;
}

interface FunctionNameToBuildResult {
  [FunctionName.Generate5eMonster]: ReturnType<typeof convert5eMonsterToTipTap>;
}

const generatorFnsByFunctionName = {
  [FunctionName.Generate5eMonster]: convert5eMonsterToTipTap,
} as {
  [key in keyof FunctionNameToToolCallResult]: (
    args: FunctionNameToToolCallResult[key],
  ) => FunctionNameToBuildResult[key];
};

export const tiptapToolCallBuilder = (
  func: ChatCompletionMessageToolCall.Function,
) => {
  const tiptapContent = build(
    func.name as FunctionName,
    JSON.parse(func.arguments),
  );
  return tiptapContent;
};

const build = <T extends FunctionName>(
  name: T,
  args: FunctionNameToToolCallResult[T],
) => {
  return generatorFnsByFunctionName[name](args);
};
