import * as Y from 'yjs';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { JSONContent } from '@tiptap/core';

export const getTiptapContentFromYjsDoc = (doc: Y.Doc, fragment: string) => {
  return TiptapTransformer.fromYdoc(doc, fragment) as JSONContent;
};
