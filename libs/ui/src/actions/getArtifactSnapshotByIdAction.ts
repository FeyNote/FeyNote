import type { ArtifactSnapshot } from '@feynote/global-types';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getArtifactSnapshotByIdAction(input: {
  id: string;
}): Promise<ArtifactSnapshot> {
  try {
    const manifestDb = await getManifestDb();
    const localArtifactSnapshot = await manifestDb.get(
      ObjectStoreName.ArtifactSnapshots,
      input.id,
    );
    if (localArtifactSnapshot) return localArtifactSnapshot;
  } catch {
    // Fall through to tRPC
  }

  return trpc.artifact.getArtifactSnapshotById.query(input);
}
