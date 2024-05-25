import {
  createReactBlockSpec,
  ReactCustomBlockImplementation,
} from '@blocknote/react';
import { CustomBlockConfig } from '@blocknote/core';

const config = {
  type: 'spellSheet',
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

export const buildSpellSheetSpec = (
  render: SpellSheetFC,
  toExternalHTML?: SpellSheetFC,
) => {
  return createReactBlockSpec(config, {
    render,
    toExternalHTML,
  });
};

export type SpellSheetFC = ReactCustomBlockImplementation<
  typeof config,
  any,
  any
>['render'];
