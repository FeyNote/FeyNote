import {
  Generate5eMonsterSchema,
  type Generate5eMonsterParams,
} from './tools/generate5eMonster';
import { convert5eMonsterToTipTap } from './converters/convert5eMonsterToTipTap';
import { parse } from 'best-effort-json-parser';
import type { ToolInvocation } from 'ai';

export enum FunctionName {
  Generate5eMonster = 'generate5eMonster',
}

interface FunctionNameToToolCallResult {
  [FunctionName.Generate5eMonster]: Generate5eMonsterParams;
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

export const tiptapToolCallBuilder = (invocation: ToolInvocation) => {
  const fncName = invocation.toolName as FunctionName;
  const tiptapContent = build(fncName, invocation.args);
  return tiptapContent;
};

const build = <T extends FunctionName>(
  name: T,
  args: FunctionNameToToolCallResult[T],
) => {
  return generatorFnsByFunctionName[name](args);
};
