import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getSafeArtifactIdAction(): Promise<{ id: string }> {
  try {
    return await trpc.artifact.getSafeArtifactId.query();
  } catch {
    const manifestDb = await getManifestDb();
    while (true) {
      const candidateId = crypto.randomUUID();
      const artifact = await manifestDb.get(
        ObjectStoreName.Artifacts,
        candidateId,
      );
      if (!artifact) {
        return { id: candidateId };
      }
    }
  }
}
