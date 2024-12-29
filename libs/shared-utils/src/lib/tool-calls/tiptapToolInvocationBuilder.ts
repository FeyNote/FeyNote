import type { ToolInvocation } from 'ai';
import { TFunction } from 'i18next';
import type { Generate5eMonsterParams } from './schemas/display5eMonsterSchema';
import { convert5eMonsterToTipTap } from './converters/convert5eMonsterToTipTap';
import type { Generate5eObjectParams } from './schemas/display5eObjectSchema';
import { convert5eObjectToTiptap } from './converters/convert5eObjectToTiptap';
import { ToolName } from './toolName';
import './toolName';

interface ToolNameToInvocationParam {
  [ToolName.Generate5eMonster]: Generate5eMonsterParams;
  [ToolName.Generate5eObject]: Generate5eObjectParams;
}

const generatorFnsByToolName = {
  [ToolName.Generate5eMonster]: convert5eMonsterToTipTap,
  [ToolName.Generate5eObject]: convert5eObjectToTiptap,
};

type InvocationBuilder = ToolName.Generate5eMonster | ToolName.Generate5eObject;
export type AllowedToolInvocation = ToolInvocation & {
  toolName: InvocationBuilder;
};

const build = <T extends InvocationBuilder>(
  name: T,
  args: ToolNameToInvocationParam[T],
  t: TFunction,
) => {
  if (!args) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return generatorFnsByToolName[name](args as any, t);
};

export const tiptapToolInvocationBuilder = (
  invocation: AllowedToolInvocation,
  t: TFunction,
) => {
  const fncName = invocation.toolName;
  const tiptapContent = build(fncName, invocation.args, t);
  return tiptapContent;
};
