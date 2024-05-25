import {
  createReactBlockSpec,
  ReactCustomBlockImplementation,
} from '@blocknote/react';
import { CustomBlockConfig } from '@blocknote/core';

const config = {
  type: 'monsterSheet',
  propSchema: {
    content: {
      default: '',
    },
    contentHtml: {
      default: '',
    },
  },
  content: 'none',
} as const satisfies CustomBlockConfig;

export const buildMonsterSheetSpec = (
  render: MonsterSheetFC,
  toExternalHTML?: MonsterSheetFC,
) => {
  return createReactBlockSpec(config, {
    render,
    toExternalHTML,
  });
};

export type MonsterSheetFC = ReactCustomBlockImplementation<
  typeof config,
  any,
  any
>['render'];
