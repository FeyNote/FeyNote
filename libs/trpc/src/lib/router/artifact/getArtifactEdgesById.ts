import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { hasArtifactAccess } from '@feynote/api-services';
import { publicProcedure } from '../../trpc';
import { Edge, getEdgeId } from '@feynote/shared-utils';

export const getArtifactEdgesById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      shareToken: z.string().optional(),
    }),
  )
  .query(
    async ({
      ctx,
      input,
    }): Promise<{
      outgoingEdges: Edge[];
      incomingEdges: Edge[];
    }> => {
      if (!ctx.session && !input.shareToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.id,
        },
        select: {
          title: true,
          userId: true,
          artifactShares: {
            select: {
              userId: true,
              accessLevel: true,
            },
          },
          artifactShareTokens: {
            select: {
              shareToken: true,
              accessLevel: true,
            },
          },
        },
      });

      if (
        !artifact ||
        !hasArtifactAccess(artifact, ctx.session?.userId, input.shareToken)
      ) {
        throw new TRPCError({
          message:
            'Artifact does not exist or is not visible to the current user',
          code: 'NOT_FOUND',
        });
      }

      const incomingEdgesPromise = prisma.artifactReference.findMany({
        where: {
          targetArtifactId: input.id,
        },
        select: {
          artifactId: true,
          artifactBlockId: true,
          targetArtifactId: true,
          targetArtifactBlockId: true,
          targetArtifactDate: true,
          referenceTargetArtifactId: true,
          referenceText: true,
          artifact: {
            select: {
              title: true,
            },
          },
        },
      });

      const outgoingEdgesPromise = prisma.artifactReference.findMany({
        where: {
          artifactId: input.id,
        },
        select: {
          artifactId: true,
          artifactBlockId: true,
          targetArtifactId: true,
          targetArtifactBlockId: true,
          targetArtifactDate: true,
          referenceTargetArtifactId: true,
          referenceText: true,
        },
      });

      const [incomingEdges, outgoingEdges] = await Promise.all([
        incomingEdgesPromise,
        outgoingEdgesPromise,
      ]);

      return {
        incomingEdges: incomingEdges.map((edge) => {
          return {
            id: getEdgeId(edge),
            artifactId: edge.artifactId,
            artifactBlockId: edge.artifactBlockId,
            targetArtifactId: edge.targetArtifactId,
            targetArtifactBlockId: edge.targetArtifactBlockId,
            targetArtifactDate: edge.targetArtifactDate,
            isBroken: !!edge.referenceTargetArtifactId,
            referenceText: edge.referenceText,
            artifactTitle: edge.artifact.title,
          };
        }),
        outgoingEdges: outgoingEdges.map((edge) => {
          return {
            id: getEdgeId(edge),
            artifactId: edge.artifactId,
            artifactBlockId: edge.artifactBlockId,
            targetArtifactId: edge.targetArtifactId,
            targetArtifactBlockId: edge.targetArtifactBlockId,
            targetArtifactDate: edge.targetArtifactDate,
            isBroken: !!edge.referenceTargetArtifactId,
            referenceText: edge.referenceText,
            artifactTitle: artifact.title,
          };
        }),
      };
    },
  );
