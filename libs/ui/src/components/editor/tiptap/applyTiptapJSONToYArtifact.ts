import { ARTIFACT_TIPTAP_BODY_KEY } from '@feynote/shared-utils';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { JSONContent } from '@tiptap/core';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { getTiptapExtensions } from './getTiptapExtensions';

export const applyTiptapJSONToYArtifact = (
  yArtifact: YDoc,
  tiptapJSON: JSONContent,
) => {
  const extensions = getTiptapExtensions({
    artifactId: undefined,
    placeholder: '',
    editable: true,
    y: {
      yDoc: yArtifact,
    },
    collaborationUser: {
      name: '',
      color: '',
    },
    getFileUrl: () => '',
  });
  const tiptapJSONAsY = TiptapTransformer.toYdoc(
    tiptapJSON,
    ARTIFACT_TIPTAP_BODY_KEY,
    extensions,
  );
  applyUpdate(yArtifact, encodeStateAsUpdate(tiptapJSONAsY));
};
