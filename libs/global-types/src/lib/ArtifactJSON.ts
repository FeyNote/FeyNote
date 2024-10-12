import type { YArtifactMeta } from './YArtifactMeta';
import type { JSONContent } from '@tiptap/core';

export interface ArtifactJSON {
  tiptapBody?: JSONContent;
  meta: YArtifactMeta;
}
