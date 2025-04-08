import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { artifactDetail, fileSummary } from '@feynote/prisma/types';
import {
  FileSizeLimitError,
  hasArtifactAccess,
  transformAndUploadFileToS3ForUser,
} from '@feynote/api-services';
import { FileDTO } from '@feynote/global-types';
import { octetInputParser } from '@trpc/server/http';
import type { ParserZodEsque } from '@trpc/server/unstable-core-do-not-import';
import { Readable } from 'stream';
import { decodeFileStream } from '@feynote/shared-utils';
import type { ReadableStream as NodeWebReadableStream } from 'stream/web';

type UtilityParser<TInput, TOutput> = ParserZodEsque<TInput, TOutput> & {
  parse: (input: unknown) => TOutput;
};
type OctetInput = Blob | Uint8Array | File;

export const createFile = authenticatedProcedure
  .input(octetInputParser as UtilityParser<OctetInput, ReadableStream>)
  .mutation(async ({ ctx, input: _input }): Promise<FileDTO> => {
    const input = await decodeFileStream(_input);
    const id = input.id;

    if (input.artifactId) {
      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.artifactId,
        },
        ...artifactDetail,
      });

      if (!artifact || !hasArtifactAccess(artifact, ctx.session.userId)) {
        throw new TRPCError({
          message:
            'Artifact does not exist or is not visible to the current user',
          code: 'NOT_FOUND',
        });
      }
    }

    let uploadResult;
    try {
      uploadResult = await transformAndUploadFileToS3ForUser({
        userId: ctx.session.userId,
        file: Readable.fromWeb(input.fileContents as NodeWebReadableStream),
        purpose: input.purpose,
        mimetype: input.mimetype,
      });
    } catch (e) {
      if (e instanceof FileSizeLimitError) {
        throw new TRPCError({
          message: 'File size exceeds maximum allowed size',
          code: 'PAYLOAD_TOO_LARGE',
        });
      }

      throw e;
    }

    const file = await prisma.file.create({
      data: {
        id,
        userId: ctx.session.userId,
        artifactId: input.artifactId,
        name: input.fileName,
        mimetype: input.mimetype,
        storageKey: uploadResult.key,
        purpose: input.purpose,
        metadata: {
          uploadResult, // We store this here in case we ever need fields from this in the future
        },
      },
      ...fileSummary,
    });

    return file;
  });
