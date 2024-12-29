import { prisma } from '@feynote/prisma/client';
import {
  getReferencesFromJSONContent,
  getReferencesFromTLDrawContent,
} from '@feynote/shared-utils';
import { Prisma } from '@prisma/client';
import { JSONContent } from '@tiptap/core';
import { Array as YArray } from 'yjs';
import type { TLRecord } from 'tldraw';

// Uniquely identify a given reference in a set for the purposes of comparing a diff between
// current state and desired state
const genCompositeKey = (args: {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string | undefined | null;
  targetArtifactDate?: string | undefined | null;
}) =>
  args.artifactBlockId +
  args.targetArtifactId +
  (args.targetArtifactBlockId || null) +
  (args.targetArtifactDate || null);

type Data =
  | {
      tldrawContent: YArray<{
        key: string;
        val: TLRecord;
      }>;
      jsonContent?: undefined;
    }
  | {
      tldrawContent?: undefined;
      jsonContent?: JSONContent;
    };

/**
 * Create/delete all references where this artifact points to another artifact
 * In this case, title reference text is used for other artifacts to reference this one directly.
 * @returns The count of references created and deleted (but not updated!)
 */
export async function updateArtifactOutgoingReferences(
  artifactId: string,
  data: Data,
  tx: Prisma.TransactionClient = prisma,
): Promise<number> {
  const referencesFromUserContent = [];
  if (data.jsonContent) {
    referencesFromUserContent.push(
      ...getReferencesFromJSONContent(data.jsonContent),
    );
  }
  if (data.tldrawContent) {
    referencesFromUserContent.push(
      ...getReferencesFromTLDrawContent(data.tldrawContent),
    );
  }
  const referencedArtifactIds = new Set(
    referencesFromUserContent.map(
      (artifactReference) => artifactReference.targetArtifactId,
    ),
  );

  // We build a list of composite ids with their associated count of occurrences so that we can
  // decrement later as we ensure the same count exists in our datastore as exists in the JSON content
  const referenceCountTracker = new Map<string, number>();
  for (const reference of referencesFromUserContent) {
    const key = genCompositeKey(reference);
    const count = referenceCountTracker.get(key) || 0;
    referenceCountTracker.set(key, count + 1);
  }

  const connectableReferencedArtifacts = await tx.artifact.findMany({
    where: {
      id: {
        in: [...referencedArtifactIds],
      },
    },
    select: {
      id: true,
    },
  });
  const connectableReferencedArtifactIds = new Set(
    connectableReferencedArtifacts.map(
      (connectableReferencedArtifact) => connectableReferencedArtifact.id,
    ),
  );

  const existingOutgoingReferences = await tx.artifactReference.findMany({
    where: {
      artifactId,
    },
  });
  const referencesToCreate =
    new Array<Prisma.ArtifactReferenceCreateManyInput>();
  const referencesToDelete = new Array<string>();

  // We want to preserve existing references wherever possible so as to preserve their reference text, and improve performance
  for (const reference of existingOutgoingReferences) {
    const key = genCompositeKey(reference);
    const count = referenceCountTracker.get(key);
    if (count && count > 0) {
      referenceCountTracker.set(key, count - 1);
    } else {
      referencesToDelete.push(reference.id);
    }
  }

  for (const reference of referencesFromUserContent) {
    const compositeKey = genCompositeKey(reference);
    const count = referenceCountTracker.get(compositeKey);
    if (count === undefined) throw new Error('This should not be possible');

    // We only want to create references where one doesn't already exist so as to preserve it's reference text, and improve performance
    if (count > 0) {
      referencesToCreate.push({
        artifactId,
        artifactBlockId: reference.artifactBlockId,

        // We allow abitrary connections (for example, to artifacts that no longer exist!), but we do not connect them with a relationship if they aren't connectable
        referenceTargetArtifactId: connectableReferencedArtifactIds.has(
          reference.targetArtifactId,
        )
          ? reference.targetArtifactId
          : undefined,

        targetArtifactId: reference.targetArtifactId,
        targetArtifactBlockId: reference.targetArtifactBlockId,
        targetArtifactDate: reference.targetArtifactDate,

        // We trust the referenceText passed to us from the client.
        // Looking the reference text up here would be very costly -- Instead, we should:
        // - Ensure the client has up-to-date referenceText at all times
        // - Update reference text when an artifact is updated
        referenceText: reference.referenceText,
      });

      referenceCountTracker.set(compositeKey, count - 1);
    }
  }

  await tx.artifactReference.deleteMany({
    where: {
      id: {
        in: [...referencesToDelete],
      },
    },
  });
  await tx.artifactReference.createMany({
    data: referencesToCreate,
  });

  return referencesToCreate.length + referencesToDelete.length;
}
