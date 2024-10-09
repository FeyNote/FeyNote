import type { ToolInvocation } from 'ai';
import { TFunction } from 'i18next';
import type { Generate5eMonsterParams } from './schemas/generate5eMonsterSchema';
import { convert5eMonsterToTipTap } from './converters/convert5eMonsterToTipTap';
import type { Generate5eObjectParams } from './schemas/generate5eObjectSchema';
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
type AllowedToolInvocation = ToolInvocation & {
  toolName: InvocationBuilder;
};

export const tiptapToolInvocationBuilder = (
  invocation: AllowedToolInvocation,
  t: TFunction,
) => {
  const fncName = invocation.toolName;
  const tiptapContent = build(fncName, invocation.args, t);
  return tiptapContent;
};

const build = <T extends InvocationBuilder>(
  name: T,
  args: ToolNameToInvocationParam[T],
  t: TFunction,
) => {
  if (!args) return;
  return generatorFnsByToolName[name](args as any, t);
};
