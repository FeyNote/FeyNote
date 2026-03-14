import type { WorkspaceSnapshot } from '@feynote/global-types';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getWorkspaceSnapshotByIdAction(input: {
  id: string;
}): Promise<WorkspaceSnapshot> {
  try {
    const manifestDb = await getManifestDb();
    const localWorkspaceSnapshot = await manifestDb.get(
      ObjectStoreName.WorkspaceSnapshots,
      input.id,
    );
    if (localWorkspaceSnapshot) return localWorkspaceSnapshot;
  } catch {
    // Fall through to tRPC
  }

  return trpc.workspace.getWorkspaceSnapshotById.query(input);
}
