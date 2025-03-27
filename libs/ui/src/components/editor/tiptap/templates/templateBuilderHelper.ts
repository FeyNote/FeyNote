import { constructYArtifact } from '@feynote/shared-utils';
import type { YArtifactMeta } from '@feynote/global-types';
import { JSONContent } from '@tiptap/core';
import { applyTiptapJSONToYArtifact } from '../applyTiptapJSONToYArtifact';
import { encodeStateAsUpdate } from 'yjs';

export interface TemplateResult {
  id: YArtifactMeta['id'];
  userId: YArtifactMeta['userId'];
  title: YArtifactMeta['title'];
  type: YArtifactMeta['type'];
  titleBodyMerge: YArtifactMeta['titleBodyMerge'];
  linkAccessLevel: YArtifactMeta['linkAccessLevel'];
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
    id: meta.id,
    userId: meta.userId,
    title: meta.title,
    type: meta.type,
    titleBodyMerge: meta.titleBodyMerge,
    linkAccessLevel: meta.linkAccessLevel,
    theme: meta.theme,
    json: {
      tiptapBody: tiptapJSON,
      meta: meta,
    },
    yBin: encodeStateAsUpdate(yDoc),
  };
};
