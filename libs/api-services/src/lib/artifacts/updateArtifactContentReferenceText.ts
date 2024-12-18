import { prisma } from '@feynote/prisma/client';
import { getJSONContentDiff } from '@feynote/shared-utils';
import { Prisma } from '@prisma/client';
import { JSONContent } from '@tiptap/core';

// We must operate in batches, because Prisma/SQL has a maximum bound parameter limit of 32767.
// Given we have 3 parameters per batch entry, that's around 10k per batch (nice round number).
const MAX_BATCH_SIZE = 10000;

/**
 * Updates all of the stored artifact content reference text for the given artifact.
 * Content reference text is used for other artifacts to the content within this one.
 */
export async function updateArtifactContentReferenceText(
  artifactId: string,
  oldTiptapContent: JSONContent,
  newTiptapContent: JSONContent,
  tx: Prisma.TransactionClient = prisma,
) {
  const diff = getJSONContentDiff(oldTiptapContent, newTiptapContent);

  // We drop to raw query here so that we can execute a PostgreSQL-specific
  // update query. This allows us to perform an update query with different values
  // all in one go, rather than a loop with a update DB query inside.
  const sqlValues = Array.from(diff.values())
    // We do not need to update reference text for deleted blocks, since they'll already be up to date
    .filter((element) => element.status !== 'deleted')
    .map((element) => {
      // SECURITY: We must use Prisma.sql to prevent SQL injection
      return Prisma.sql`(${artifactId}::uuid, ${element.id}, ${element.referenceText})`;
    });

  // We cannot perform an update call with an empty set of values
  if (!sqlValues.length) return;

  // We must operate in batches, because Prisma/SQL has a maximum bound parameter limit of 32767.
  const batches = sqlValues.reduce((acc, value) => {
    const previousBatch = acc.at(-1);
    if (previousBatch && previousBatch.length < MAX_BATCH_SIZE) {
      previousBatch.push(value);
    } else {
      const newBatch = [value];
      acc.push(newBatch);
    }

    return acc;
  }, [] as Prisma.Sql[][]);

  for (const batch of batches) {
    await tx.$queryRaw`
      UPDATE "ArtifactReference" AS ar SET
        "referenceText" = c."referenceText"
      FROM (VALUES
        ${Prisma.join(
          // SECURITY: We must use Prisma.join to prevent SQL injection
          batch,
        )}
      ) as c("targetArtifactId", "targetArtifactBlockId", "referenceText")
      WHERE
        c."targetArtifactId" = ar."targetArtifactId"
        AND
        c."targetArtifactBlockId" = ar."targetArtifactBlockId"
    `;
  }
}
