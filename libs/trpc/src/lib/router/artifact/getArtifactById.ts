import { getArtifactDetailById } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { patchBlocksWithReferenceText } from '@feynote/shared-utils';

export const getArtifactById = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const artifact = await getArtifactDetailById(input.id);

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    if (artifact.json.blocknoteContent) {
      patchBlocksWithReferenceText(
        artifact.json.blocknoteContent,
        artifact.artifactReferences.map((artifactReference) => ({
          artifactBlockId: artifactReference.artifactBlockId,
          targetArtifactId: artifactReference.targetArtifactId,
          targetArtifactBlockId:
            artifactReference.targetArtifactBlockId || undefined,
          referenceText: artifactReference.referenceText,
          isBroken: !artifactReference.referenceTargetArtifactId,
        })),
      );
    }

    return artifact;
  });
