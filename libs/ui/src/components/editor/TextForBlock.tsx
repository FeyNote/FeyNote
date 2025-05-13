import { useEffect, useState } from 'react';
import { applyUpdate, Doc as YDoc } from 'yjs';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getJSONContentParent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';
import { getTextForJSONContentWithEdges } from './tiptap/extensions/artifactReferences/getTextForJSONContentWithEdges';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

interface Props {
  artifactId: string;
  blockId: string;
}

/**
 * Will pull and render text for any blockId, connecting to the network in the process.
 * Keep in mind that this is quite heavy, and if you load this component in a loop, it will
 * consume a large amount of RAM.
 */
export const TextForBlock = (props: Props) => {
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [blockText, setBlockText] = useState<string | undefined>(undefined);

  const updateBlockText = async () => {
    const response = await trpc.artifact.getArtifactYBinById
      .query({
        id: props.artifactId,
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
    if (!response) return;

    const yDoc = new YDoc();
    applyUpdate(yDoc, response.yBin);

    const jsonContent = getTiptapContentFromYjsDoc(
      yDoc,
      ARTIFACT_TIPTAP_BODY_KEY,
    );
    const parentBlockForReference = getJSONContentParent(
      jsonContent,
      props.blockId,
    );
    if (parentBlockForReference) {
      const text = await getTextForJSONContentWithEdges({
        root: parentBlockForReference,
        artifactId: props.artifactId,
      });
      setBlockText(text);
    }
  };

  useEffect(() => {
    updateBlockText();
  }, [props.artifactId, props.blockId]);

  return blockText;
};
