import { JSONContent } from '@tiptap/core';

type JSONContentBasedRootTemplate = {
  jsonContent: JSONContent;
};

type StringBasedRootTemplate = {
  markdown: string;
};

export type RootTemplate = {
  id: string;
  title: string;
  rootTemplate: true;
} & (JSONContentBasedRootTemplate | StringBasedRootTemplate);
