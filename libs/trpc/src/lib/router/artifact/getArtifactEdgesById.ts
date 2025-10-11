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
          linkAccessLevel: true,
          deletedAt: true,
        },
      });

      if (!artifact || !hasArtifactAccess(artifact, ctx.session?.userId)) {
        throw new TRPCError({
          message:
            'Artifact does not exist or is not visible to the current user',
          code: 'NOT_FOUND',
        });
      }

      const incomingEdgesPromise = prisma.artifactReference.findMany({
        where: {
          targetArtifactId: input.id,
          artifact: {
            deletedAt: null,
          },
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
              userId: true,
              artifactShares: {
                select: {
                  userId: true,
                  accessLevel: true,
                },
              },
              linkAccessLevel: true,
              deletedAt: true,
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
          targetArtifact: {
            select: {
              title: true,
              deletedAt: true,
            },
          },
        },
      });

      const [incomingEdges, outgoingEdges] = await Promise.all([
        incomingEdgesPromise,
        outgoingEdgesPromise,
      ]);

      return {
        incomingEdges: incomingEdges
          .filter((edge) => {
            // We do not want to show incoming references from artifacts you do not have access to
            return hasArtifactAccess(edge.artifact, ctx.session?.userId);
          })
          .map((edge) => {
            return {
              id: getEdgeId(edge),
              artifactId: edge.artifactId,
              artifactBlockId: edge.artifactBlockId,
              artifactTitle: edge.artifact.title,
              artifactDeleted: !!edge.artifact.deletedAt,
              targetArtifactId: edge.targetArtifactId,
              targetArtifactBlockId: edge.targetArtifactBlockId,
              targetArtifactDate: edge.targetArtifactDate,
              targetArtifactTitle: artifact.title,
              targetArtifactDeleted: !!artifact.deletedAt,
              referenceText: edge.referenceText,
            };
          }),
        outgoingEdges: outgoingEdges.map((edge) => {
          return {
            id: getEdgeId(edge),
            artifactId: edge.artifactId,
            artifactBlockId: edge.artifactBlockId,
            artifactTitle: artifact.title,
            artifactDeleted: !!artifact.deletedAt,
            targetArtifactId: edge.targetArtifactId,
            targetArtifactBlockId: edge.targetArtifactBlockId,
            targetArtifactDate: edge.targetArtifactDate,
            targetArtifactTitle: edge.targetArtifact?.title || null,
            targetArtifactDeleted:
              !!edge.targetArtifact && !!edge.targetArtifact.deletedAt,
            referenceText: edge.referenceText,
          };
        }),
      };
    },
  );
