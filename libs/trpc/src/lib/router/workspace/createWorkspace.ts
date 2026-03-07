import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import {
  constructWorkspaceYDoc,
  getWorkspaceMetaFromYDoc,
} from '@feynote/shared-utils';
import { applyUpdate, encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { enqueueWorkspaceUpdate } from '@feynote/queue';
import { TRPCError } from '@trpc/server';
import * as Sentry from '@sentry/node';

export const createWorkspace = authenticatedProcedure
  .input(
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255),
        icon: z.string().optional(),
        color: z.string().optional(),
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
      const { yDoc, meta } = (() => {
        if ('yBin' in input) {
          const yDoc = new YDoc();
          applyUpdate(yDoc, input.yBin);

          const meta = getWorkspaceMetaFromYDoc(yDoc);

          if (!meta.id || !meta.userId) {
            throw new TRPCError({
              message:
                'Workspace document is missing required metadata (id or userId)',
              code: 'BAD_REQUEST',
            });
          }

          if (meta.userId !== ctx.session.userId) {
            throw new TRPCError({
              message: 'You cannot create a workspace for another user',
              code: 'BAD_REQUEST',
            });
          }

          return { yDoc, meta: { ...meta, id: meta.id, userId: meta.userId } };
        }

        if ('id' in input) {
          const yDoc = constructWorkspaceYDoc({
            id: input.id,
            userId: ctx.session.userId,
            name: input.name,
            icon: input.icon,
            color: input.color,
          });

          const meta = getWorkspaceMetaFromYDoc(yDoc);

          if (!meta.id || !meta.userId) {
            throw new TRPCError({
              message:
                'Workspace document is missing required metadata (id or userId)',
              code: 'BAD_REQUEST',
            });
          }

          return { yDoc, meta: { ...meta, id: meta.id, userId: meta.userId } };
        }

        throw new Error('Unhandled conditional');
      })();

      const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

      const existingConflict = await prisma.workspace.findUnique({
        where: {
          id: meta.id,
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
          Sentry.captureMessage('Workspace UUID collision between two users', {
            extra: {
              workspaceId: meta.id,
              userId: ctx.session.userId,
              conflictedUserId: existingConflict.userId,
            },
          });
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'That workspace ID is already in use by another person.',
          });
        }
      }

      const workspace = await prisma.workspace.create({
        data: {
          id: meta.id,
          userId: ctx.session.userId,
          name: meta.name,
          icon: meta.icon,
          color: meta.color,
          yBin,
        },
        select: {
          id: true,
          userId: true,
        },
      });

      await enqueueWorkspaceUpdate({
        workspaceId: workspace.id,
        userId: workspace.userId,
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
