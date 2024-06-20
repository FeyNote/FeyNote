import { beforeHandleMessagePayload } from '@hocuspocus/server';

import { yArtifactMetaSchema } from '@feynote/api-services';
import { getMetaFromYArtifact } from '@feynote/shared-utils';

export async function beforeHandleMessage(args: beforeHandleMessagePayload) {
  // Validate artifact meta
  const artifactMeta = getMetaFromYArtifact(args.document);
  yArtifactMetaSchema.parse(artifactMeta);

  // TODO: validate entire yDoc schema
}
