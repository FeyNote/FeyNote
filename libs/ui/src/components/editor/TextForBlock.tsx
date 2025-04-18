import { useContext, useEffect, useState } from 'react';
import { collaborationManager } from './collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getJSONContentParent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';
import { getTextForJSONContentWithEdges } from './tiptap/extensions/artifactReferences/getTextForJSONContentWithEdges';

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
  const { session } = useContext(SessionContext);
  const [blockText, setBlockText] = useState<string | undefined>(undefined);

  const connection = collaborationManager.get(
    `artifact:${props.artifactId}`,
    session,
  );

  const updateBlockText = async () => {
    await connection.syncedPromise;

    const jsonContent = getTiptapContentFromYjsDoc(
      connection.yjsDoc,
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
  }, [props.artifactId, props.blockId, connection]);

  return blockText;
};
