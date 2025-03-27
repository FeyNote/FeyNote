import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getTiptapContentFromYjsDoc,
  getTLDrawContentFromYDoc,
  randomizeJSONContentUUIDs,
  randomizeTLDrawContentShapeIds,
} from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';
import { applyTiptapJSONToYArtifact } from '../../components/editor/tiptap/applyTiptapJSONToYArtifact';

/**
 * Randomizes all IDs within the provided yDoc in-place (mutates the yDoc).
 * CAUTION: This will break all references if used on an existing yDoc.
 */
export const randomizeContentUUIDsInYDoc = (yDoc: YDoc): void => {
  const tiptapContent = getTiptapContentFromYjsDoc(
    yDoc,
    ARTIFACT_TIPTAP_BODY_KEY,
  );
  randomizeJSONContentUUIDs(tiptapContent);
  applyTiptapJSONToYArtifact(yDoc, tiptapContent);

  const tldrawContent = getTLDrawContentFromYDoc(yDoc);
  randomizeTLDrawContentShapeIds(tldrawContent);
};
