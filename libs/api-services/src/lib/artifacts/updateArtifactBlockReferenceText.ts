import { ArtifactEditorBlock } from '@feynote/blocknote';
import { prisma } from '@feynote/prisma/client';
import { getBlocksDiff } from '@feynote/shared-utils';
import { Prisma } from '@prisma/client';

/**
 * Updates all of the stored artifact block reference text for the given artifact.
 * Block reference text is used for other artifacts to the blocks within this one.
 */
export async function updateArtifactBlockReferenceText(
  artifactId: string,
  oldBlocknoteContent: ArtifactEditorBlock[],
  newBlocknoteContent: ArtifactEditorBlock[],
  tx: Prisma.TransactionClient = prisma,
) {
  const diff = getBlocksDiff(
    oldBlocknoteContent || [],
    newBlocknoteContent || [],
  );

  // We drop to raw query here so that we can execute a PostgreSQL-specific
  // update query. This allows us to perform an update query with different values
  // all in one go, rather than a loop with a update DB query inside.
  const sqlValues = Array.from(diff.values())
    // We do not need to update reference text for deleted blocks, since they'll already be up to date
    .filter((element) => element.status !== 'deleted')
    .map((element) => {
      // SECURITY: We must use Prisma.sql to prevent SQL injection
      return Prisma.sql`(${artifactId}::uuid, ${element.id}::uuid, ${element.referenceText})`;
    });

  // We cannot perform an update call with an empty set of values
  if (!sqlValues.length) return;

  await tx.$queryRaw`
    UPDATE "ArtifactReference" AS ar SET
      "referenceText" = c."referenceText"
    FROM (VALUES
      ${Prisma.join(
        // SECURITY: We must use Prisma.join to prevent SQL injection
        sqlValues,
      )}
    ) as c("targetArtifactId", "targetArtifactBlockId", "referenceText")
    WHERE
      c."targetArtifactId" = ar."targetArtifactId"
      AND
      c."targetArtifactBlockId" = ar."targetArtifactBlockId"
  `;
}
