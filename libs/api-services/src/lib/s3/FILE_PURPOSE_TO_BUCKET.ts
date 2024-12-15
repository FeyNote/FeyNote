import { globalServerConfig } from '@feynote/config';
import { FilePurpose } from '@prisma/client';

export const FILE_PURPOSE_TO_BUCKET = {
  [FilePurpose.artifact]: globalServerConfig.aws.buckets.artifact,
  [FilePurpose.import]: globalServerConfig.aws.buckets.import,
};
