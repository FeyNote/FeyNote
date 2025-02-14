import { jsonContentForEach } from './jsonContentForEach';
import { generateJSON } from '@tiptap/core';

export const addMissingBlockIds = (tiptap: Record<string, typeof generateJSON>) => {
  jsonContentForEach(tiptap, (node) => {
    if (node['type'] === 'paragraph' || node['type'] === 'heading' || node['type'] === 'artifactReference') {
      if (!node['attrs']) {
        node['attrs'] = {};
      }
      if (!node['attrs']['id']) {
        node['attrs']['id'] = crypto.randomUUID();
      }
    }
  })
}
