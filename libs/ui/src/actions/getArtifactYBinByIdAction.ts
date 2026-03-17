import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';
import { YIndexedDBProvider } from '../utils/collaboration/YIndexedDBProvider';

export async function getArtifactYBinByIdAction(input: {
  id: string;
}): Promise<{ yBin: Uint8Array }> {
  try {
    const manifestDb = await getManifestDb();
    const manifestArtifactVersion = await manifestDb.get(
      ObjectStoreName.ArtifactVersions,
      input.id,
    );
    if (!manifestArtifactVersion) {
      return trpc.artifact.getArtifactYBinById.query(input);
    }

    const docName = `artifact:${input.id}`;
    const yBin = await YIndexedDBProvider.getDocAsUpdate(docName);

    return { yBin };
  } catch {
    return trpc.artifact.getArtifactYBinById.query(input);
  }
}
