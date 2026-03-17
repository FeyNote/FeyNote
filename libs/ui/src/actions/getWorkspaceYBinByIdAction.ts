import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';
import { YIndexedDBProvider } from '../utils/collaboration/YIndexedDBProvider';

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
    const yBin = await YIndexedDBProvider.getDocAsUpdate(docName);

    return { yBin };
  } catch {
    return trpc.workspace.getWorkspaceYBinById.query(input);
  }
}
