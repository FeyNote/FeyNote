import { Doc as YDoc } from 'yjs';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { JSONContent } from '@tiptap/core';

export const getTiptapContentFromYjsDoc = (doc: YDoc, fragment: string) => {
  return TiptapTransformer.fromYdoc(doc, fragment) as JSONContent;
};
