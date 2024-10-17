import { constructYArtifact } from '@feynote/shared-utils';
import type { YArtifactMeta } from '@feynote/prisma/types';
import { JSONContent } from '@tiptap/core';
import { applyTiptapJSONToYArtifact } from '../applyTiptapJSONToYArtifact';
import { encodeStateAsUpdate } from 'yjs';

export interface TemplateResult {
  title: YArtifactMeta['title'];
  type: YArtifactMeta['type'];
  titleBodyMerge: YArtifactMeta['titleBodyMerge'];
  theme: YArtifactMeta['theme'];
  json: {
    tiptapBody: JSONContent;
    meta: YArtifactMeta;
  };
  yBin: Uint8Array;
}

export const templateBuilderHelper = (
  meta: YArtifactMeta,
  tiptapJSON: JSONContent,
): TemplateResult => {
  const yDoc = constructYArtifact(meta);
  applyTiptapJSONToYArtifact(yDoc, tiptapJSON);

  return {
    title: meta.title,
    type: meta.type,
    titleBodyMerge: meta.titleBodyMerge,
    theme: meta.theme,
    json: {
      tiptapBody: tiptapJSON,
      meta: meta,
    },
    yBin: encodeStateAsUpdate(yDoc),
  };
};
