import {
  createReactBlockSpec,
  ReactCustomBlockImplementation,
} from '@blocknote/react';
import { CustomBlockConfig } from '@blocknote/core';

const config = {
  type: 'horizontalRule',
  propSchema: {},
  content: 'none',
} as const satisfies CustomBlockConfig;

export const buildHorizontalRuleSpec = (render: HorizontalRuleFC) => {
  return createReactBlockSpec(config, {
    render,
  });
};

export type HorizontalRuleFC = ReactCustomBlockImplementation<
  typeof config,
  any,
  any
>['render'];
