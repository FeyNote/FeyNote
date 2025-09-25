import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { enqueueArtifactUpdate } from '@feynote/queue';
import { yArtifactMetaZodSchema } from '@feynote/api-services';
import {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import * as Sentry from '@sentry/node';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';
import { ArtifactJSON, YArtifactMeta } from '@feynote/global-types';
import { TRPCError } from '@trpc/server';

export const createArtifact = authenticatedProcedure
  .input(
    z
      .object({
        id: z.string().uuid(),
        title: z.string(),
        type: z.nativeEnum(ArtifactType),
        theme: z.nativeEnum(ArtifactTheme),
        // We follow our YKeyValue structure for userAccess
        userAccess: z
          .array(
            z.object({
              key: z.string(), // UserID
              val: z.object({
                accessLevel: z.nativeEnum(ArtifactAccessLevel),
              }),
            }),
          )
          .optional(),
        linkAccessLevel: z.nativeEnum(ArtifactAccessLevel).optional(),
        deletedAt: z.date().optional(),
        createdAt: z.date().optional(),
        yBin: z.undefined(),
      })
      .or(
        z.object({
          yBin: z.any(),
        }),
      ),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      result: 'created' | 'exists';
    }> => {
      const { yDoc, artifactMeta } = (() => {
        if ('yBin' in input) {
          const yDoc = new YDoc();
          applyUpdate(yDoc, input.yBin);

          // Even though we are overriding the meta here, we still want to validate it
          const artifactMeta = getMetaFromYArtifact(yDoc);
          yArtifactMetaZodSchema.parse(artifactMeta);

          if (artifactMeta.userId !== ctx.session.userId) {
            throw new TRPCError({
              message: 'You cannot create an artifact for another user',
              code: 'BAD_REQUEST',
            });
          }

          return { yDoc, artifactMeta };
        }

        // Typescript does not want to narrow here in an "else" (at the time of writing), so we check individually
        if ('id' in input) {
          const artifactMeta = {
            id: input.id,
            userId: ctx.session.userId,
            title: input.title,
            theme: input.theme,
            type: input.type,
            linkAccessLevel:
              input.linkAccessLevel ?? ArtifactAccessLevel.noaccess,
            createdAt: input.createdAt?.getTime() || new Date().getTime(),
            deletedAt: input.deletedAt?.getTime() ?? null,
          } satisfies YArtifactMeta;

          if (input.userAccess?.some((el) => el.key === ctx.session.userId)) {
            throw new TRPCError({
              message: 'You cannot share an artifact with yourself',
              code: 'BAD_REQUEST',
            });
          }

          const yDoc = constructYArtifact(artifactMeta, input.userAccess);

          return { yDoc, artifactMeta };
        }

        // "Just Typescript things" TM
        throw new Error('Unhandled conditional');
      })();

      const json = {
        tiptapBody:
          artifactMeta.type === 'tiptap'
            ? getTiptapContentFromYjsDoc(yDoc, ARTIFACT_TIPTAP_BODY_KEY)
            : undefined,
        meta: artifactMeta,
      } satisfies ArtifactJSON;

      const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

      let text = '';
      if (json.tiptapBody) {
        text = getTextForJSONContent(json.tiptapBody);
      }

      const existingConflict = await prisma.artifact.findUnique({
        where: {
          id: artifactMeta.id,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (existingConflict) {
        if (existingConflict.userId === ctx.session.userId) {
          return {
            result: 'exists',
          };
        } else {
          Sentry.captureMessage(
            "We've hit the very unlikely, and very unfortunate scenario where a UUID generated collided between two users",
            {
              extra: {
                artifactId: artifactMeta.id,
                userId: ctx.session.userId,
                conflictedArtifactUserId: existingConflict.userId,
              },
            },
          );
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'That artifact ID is already in use by another person.',
          });
        }
      }

      const artifact = await prisma.artifact.create({
        data: {
          id: artifactMeta.id,
          title: artifactMeta.title,
          type: artifactMeta.type,
          text,
          json,
          userId: ctx.session.userId,
          theme: artifactMeta.theme,
          yBin,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      await enqueueArtifactUpdate({
        artifactId: artifact.id,
        userId: artifact.userId,
        triggeredByUserId: ctx.session.userId,
        oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
          'base64',
        ),
        newYBinB64: yBin.toString('base64'),
      });

      return {
        result: 'created',
      };
    },
  );
