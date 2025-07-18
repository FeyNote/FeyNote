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
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  constructYArtifact,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
  updateYArtifactMeta,
} from '@feynote/shared-utils';
import { Doc as YDoc } from 'yjs';
import { ArtifactJSON, YArtifactMeta } from '@feynote/global-types';

export const createArtifact = authenticatedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      type: z.nativeEnum(ArtifactType),
      theme: z.nativeEnum(ArtifactTheme),
      linkAccessLevel: z.nativeEnum(ArtifactAccessLevel).optional(),
      deletedAt: z.date().optional(),
      yBin: z.any().optional(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
      let yDoc: YDoc | undefined;
      const meta = {
        id: input.id,
        userId: ctx.session.userId,
        title: input.title,
        theme: input.theme,
        type: input.type,
        linkAccessLevel: input.linkAccessLevel ?? ArtifactAccessLevel.noaccess,
        deletedAt: input.deletedAt?.toISOString() ?? null,
      } satisfies YArtifactMeta;

      if (input.yBin) {
        yDoc = new YDoc();
        applyUpdate(yDoc, input.yBin);

        // Even though we are overriding the meta here, we still want to validate it
        const artifactMeta = getMetaFromYArtifact(yDoc);
        yArtifactMetaZodSchema.parse(artifactMeta);

        // We do not trust the client here and instead prefer to force the meta to be what was passed
        updateYArtifactMeta(yDoc, meta);
        const _yDoc = yDoc; // Immutable reference for TS
        _yDoc.transact(() => {
          _yDoc.getMap(ARTIFACT_META_KEY).set('id', meta.id);
          _yDoc.getMap(ARTIFACT_META_KEY).set('userId', meta.userId);
        });
      } else {
        yDoc = constructYArtifact(meta);
      }

      const json = {
        tiptapBody:
          input.type === 'tiptap'
            ? getTiptapContentFromYjsDoc(yDoc, ARTIFACT_TIPTAP_BODY_KEY)
            : undefined,
        meta,
      } satisfies ArtifactJSON;

      const yBin = Buffer.from(encodeStateAsUpdate(yDoc));

      let text = '';
      if (json.tiptapBody) {
        text = getTextForJSONContent(json.tiptapBody);
      }

      const artifact = await prisma.artifact.create({
        data: {
          id: input.id,
          title: input.title,
          type: input.type,
          text,
          json,
          userId: ctx.session.userId,
          theme: input.theme,
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
        oldReadableUserIds: [],
        newReadableUserIds: [ctx.session.userId],
        oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
          'base64',
        ),
        newYBinB64: yBin.toString('base64'),
      });

      // We only return ID since we expect frontend to fetch artifact via getArtifactById
      // rather than adding that logic here.
      return {
        id: artifact.id,
      };
    },
  );
