import { beforeHandleMessagePayload } from '@hocuspocus/server';

import { yArtifactMetaSchema } from '@feynote/api-services';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { splitDocumentName } from './splitDocumentName';
import { SupportedDocumentType } from './SupportedDocumentType';

export async function beforeHandleMessage(args: beforeHandleMessagePayload) {
  const [type, identifier] = splitDocumentName(args.documentName);

  switch (type) {
    case SupportedDocumentType.Manifest: {
      if (identifier !== args.context.userId) {
        // Users can only connect to their own manifests
        console.error("User not authorized for manifest");
        throw new Error();
      }
    }

    case SupportedDocumentType.Artifact: {
      // TODO validate sharing access
      // 1. Check if the artifact exists
      // 2. If it does, check if the user id is permitted edit/read/none access
      // 3. Figure out how to set edit vs read-only access
      //
      //
      // Validate artifact meta (disabled since we now allow sync from frontend, which happens in multiple update steps)
      // const artifactMeta = getMetaFromYArtifact(args.document);
      // console.log(artifactMeta);
      // yArtifactMetaSchema.parse(artifactMeta);

      // TODO: validate entire yDoc schema
    }
  }
}
