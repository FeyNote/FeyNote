import { customTrpcTransformer } from '@feynote/shared-utils';
import { getManifestDb, type ObjectStoreName } from '@feynote/ui-sw';

export async function updateListCache(
  objectStoreName: ObjectStoreName,
  trpcResponse: Response,
) {
  const json = await trpcResponse.json();
  const deserialized = customTrpcTransformer.deserialize(json.result.data) as {
    id: string;
    updatedAt: string;
  }[];
  const manifestDb = await getManifestDb();

  const tx = manifestDb.transaction(objectStoreName, 'readwrite');
  const store = tx.objectStore(objectStoreName);
  await store.clear();
  for (const item of deserialized) {
    await manifestDb.put(objectStoreName, item);
  }
  await tx.done;
}
