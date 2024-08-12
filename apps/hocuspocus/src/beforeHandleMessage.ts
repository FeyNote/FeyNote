import { beforeHandleMessagePayload } from '@hocuspocus/server';

import { yArtifactMetaSchema } from '@feynote/api-services';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';

export async function beforeHandleMessage(args: beforeHandleMessagePayload) {
  try {
    const [type] = splitDocumentName(args.documentName);

    switch (type) {
      case SupportedDocumentType.Artifact: {
        // Validate artifact meta
        const artifactMeta = getMetaFromYArtifact(args.document);
        yArtifactMetaSchema.parse(artifactMeta);

        // TODO validate sharing access
        // 1. Check if the artifact exists
        // 2. If it does, check if the user id is permitted edit/read/none access
        // 3. Set read-only access on connection

        // TODO: potentially validate entire yDoc schema
        break;
      }
    }
  } catch (e) {
    console.error(e);

    throw e;
  }
}
