import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';
import { IndexeddbPersistence } from 'y-indexeddb';
import { encodeStateAsUpdate, Doc as YDoc } from 'yjs';

export async function getWorkspaceYBinByIdAction(input: {
  id: string;
}): Promise<{ yBin: Uint8Array }> {
  try {
    const manifestDb = await getManifestDb();
    const manifestWorkspaceVersion = await manifestDb.get(
      ObjectStoreName.WorkspaceVersions,
      input.id,
    );
    if (!manifestWorkspaceVersion) {
      return trpc.workspace.getWorkspaceYBinById.query(input);
    }

    const docName = `workspace:${input.id}`;
    const idbPersistence = new IndexeddbPersistence(docName, new YDoc());
    await idbPersistence.whenSynced;

    const yBin = encodeStateAsUpdate(idbPersistence.doc);

    idbPersistence.doc.destroy();
    await idbPersistence.destroy();

    return { yBin };
  } catch {
    return trpc.workspace.getWorkspaceYBinById.query(input);
  }
}
