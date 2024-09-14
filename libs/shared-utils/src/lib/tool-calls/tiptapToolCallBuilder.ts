import { type Generate5eMonsterParams } from './tools/generate5eMonster';
import { convert5eMonsterToTipTap } from './converters/convert5eMonsterToTipTap';
import type { ToolInvocation } from 'ai';
import type { Generate5eItemParams } from './tools/generate5eItem';
import { convert5eItemToTipTap } from './converters/convert5eItemToTipTap';
import type { Generate5eSpellParams } from './tools/generate5eSpell';
import { convert5eSpellToTipTap } from './converters/convert5eSpellToTipTap';
import type { Generate5eWeaponParams } from './tools/generate5eWeapon';
import { convert5eWeaponToTipTap } from './converters/convert5eWeaponToTipTap';
import type { Generate5eObjectParams } from './tools/generate5eObject';
import { convert5eObjectToTiptap } from './converters/convert5eObjectToTiptap';

export enum FunctionName {
  Generate5eMonster = 'generate5eMonster',
  Generate5eItem = 'generate5eItem',
  Generate5eSpell = 'generate5eSpell',
  Generate5eWeapon = 'generate5eWeapon',
  Generate5eObject = 'generate5eObject',
}

interface FunctionNameToToolCallResult {
  [FunctionName.Generate5eMonster]: Generate5eMonsterParams;
  [FunctionName.Generate5eItem]: Generate5eItemParams;
  [FunctionName.Generate5eSpell]: Generate5eSpellParams;
  [FunctionName.Generate5eWeapon]: Generate5eWeaponParams;
  [FunctionName.Generate5eObject]: Generate5eObjectParams;
}

interface FunctionNameToBuildResult {
  [FunctionName.Generate5eMonster]: ReturnType<typeof convert5eMonsterToTipTap>;
  [FunctionName.Generate5eItem]: ReturnType<typeof convert5eItemToTipTap>;
  [FunctionName.Generate5eSpell]: ReturnType<typeof convert5eSpellToTipTap>;
  [FunctionName.Generate5eWeapon]: ReturnType<typeof convert5eWeaponToTipTap>;
  [FunctionName.Generate5eObject]: ReturnType<typeof convert5eObjectToTiptap>;
}

const generatorFnsByFunctionName = {
  [FunctionName.Generate5eMonster]: convert5eMonsterToTipTap,
  [FunctionName.Generate5eItem]: convert5eItemToTipTap,
  [FunctionName.Generate5eSpell]: convert5eSpellToTipTap,
  [FunctionName.Generate5eWeapon]: convert5eWeaponToTipTap,
  [FunctionName.Generate5eObject]: convert5eObjectToTiptap,
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
