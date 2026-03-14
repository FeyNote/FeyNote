import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';
import { IndexeddbPersistence } from 'y-indexeddb';
import { encodeStateAsUpdate, Doc as YDoc } from 'yjs';

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
    const idbPersistence = new IndexeddbPersistence(docName, new YDoc());
    await idbPersistence.whenSynced;

    const yBin = encodeStateAsUpdate(idbPersistence.doc);

    idbPersistence.doc.destroy();
    await idbPersistence.destroy();

    return { yBin };
  } catch {
    return trpc.artifact.getArtifactYBinById.query(input);
  }
}
