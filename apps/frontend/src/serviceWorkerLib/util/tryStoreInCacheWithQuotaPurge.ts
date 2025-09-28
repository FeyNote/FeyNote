import { limitCacheToMaxEntries } from './limitCacheToMaxEntries';
import { purgeOldestCacheEntries } from './purgeOldestCacheEntries';

export async function tryStoreInCacheWithQuotaPurge(
  cache: Cache,
  request: Request,
  response: Response,
  maxCacheEntries = 50,
) {
  try {
    await limitCacheToMaxEntries(cache, maxCacheEntries - 1);
    await cache.put(request, response.clone());
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      await purgeOldestCacheEntries(cache);
    }
  }
}
