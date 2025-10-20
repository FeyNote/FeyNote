import { customTrpcTransformer } from '@feynote/shared-utils';
import { getManifestDb, type ObjectStoreName } from '@feynote/ui-sw';

export async function updateSingleCache(
  objectStoreName: ObjectStoreName,
  trpcResponse: Response,
) {
  try {
    const json = await trpcResponse.json();
    const deserialized = customTrpcTransformer.deserialize(
      json.result.data,
    ) as {
      id: string;
    };

    const manifestDb = await getManifestDb();
    await manifestDb.put(objectStoreName, deserialized);
  } catch (e) {
    // We eat errors here because this method is not awaited when used
    console.error(e);
  }
}
