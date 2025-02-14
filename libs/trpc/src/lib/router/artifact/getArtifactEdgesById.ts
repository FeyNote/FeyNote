import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { publicProcedure } from '../../trpc';
import { Edge, getEdgeId } from '@feynote/shared-utils';
import { ArtifactAccessLevel } from '@prisma/client';
import { getArtifactAccessLevel } from '@feynote/api-services';

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
        },
      });

      if (!artifact) {
        throw new TRPCError({
          message: 'Artifact does not exist',
          code: 'NOT_FOUND',
        });
      }

      const accessLevel = await getArtifactAccessLevel({
        currentUserId: ctx.session?.userId,
        artifact: input.id,
      });

      if (accessLevel === ArtifactAccessLevel.noaccess) {
        throw new TRPCError({
          message: 'You do not have rights to view this artifact',
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
            isBroken: !edge.referenceTargetArtifactId,
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
            isBroken: !edge.referenceTargetArtifactId,
            referenceText: edge.referenceText,
            artifactTitle: artifact.title,
          };
        }),
      };
    },
  );
