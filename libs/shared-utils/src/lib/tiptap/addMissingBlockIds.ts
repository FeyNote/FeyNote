import { jsonContentForEach } from './jsonContentForEach';
import { generateJSON } from '@tiptap/core';
import { TiptapBlockType } from './TiptapBlockType';

export const addMissingBlockIds = (
  tiptap: Record<string, typeof generateJSON>,
) => {
  jsonContentForEach(tiptap, (node) => {
    if (
      node['type'] === TiptapBlockType.Paragraph ||
      node['type'] === TiptapBlockType.Heading ||
      node['type'] === TiptapBlockType.ArtifactReference
    ) {
      if (!node['attrs']) {
        node['attrs'] = {};
      }
      if (!node['attrs']['id']) {
        node['attrs']['id'] = crypto.randomUUID();
      }
    }
  });
};
