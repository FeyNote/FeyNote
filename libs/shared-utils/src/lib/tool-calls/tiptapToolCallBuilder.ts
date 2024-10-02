import type { ToolInvocation } from 'ai';
import { TFunction } from 'i18next';
import { Generate5eMonsterParams } from './tools/generate5eMonster';
import { convert5eMonsterToTipTap } from './converters/convert5eMonsterToTipTap';
import { Generate5eObjectParams } from './tools/generate5eObject';
import { convert5eObjectToTiptap } from './converters/convert5eObjectToTiptap';
import { Generate5eItemParams } from './tools/generate5eItem';
import { convert5eItemToTipTap } from './converters/convert5eItemToTipTap';

export enum FunctionName {
  Generate5eMonster = 'generate5eMonster',
  Generate5eObject = 'generate5eObject',
  Generate5eItem = 'generate5eItem',
}

interface FunctionNameToToolCallResult {
  [FunctionName.Generate5eMonster]: Generate5eMonsterParams;
  [FunctionName.Generate5eObject]: Generate5eObjectParams;
  [FunctionName.Generate5eItem]: Generate5eItemParams;
}

const generatorFnsByFunctionName = {
  [FunctionName.Generate5eMonster]: convert5eMonsterToTipTap,
  [FunctionName.Generate5eObject]: convert5eObjectToTiptap,
  [FunctionName.Generate5eItem]: convert5eItemToTipTap,
};

export const tiptapToolCallBuilder = (
  invocation: ToolInvocation,
  t: TFunction,
) => {
  console.log(invocation);
  const fncName = invocation.toolName as FunctionName;
  const tiptapContent = build(fncName, invocation.args, t);
  return tiptapContent;
};

const build = <T extends FunctionName>(
  name: T,
  args: FunctionNameToToolCallResult[T],
  t: TFunction,
) => {
  if (!args) return;
  return generatorFnsByFunctionName[name](args as any, t);
};
