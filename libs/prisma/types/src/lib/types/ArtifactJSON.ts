import { YArtifactMeta } from './YArtifactMeta';
import { JSONContent } from '@tiptap/core';

export interface ArtifactJSON {
  tiptapBody?: JSONContent;
  meta: YArtifactMeta;
}
