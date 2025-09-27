import { purgeOldestCacheEntries } from './purgeOldestCacheEntries';

export async function limitCacheToMaxEntries(cache: Cache, maxEntries = 50) {
  const requests = await cache.keys();
  if (requests.length > maxEntries) {
    await purgeOldestCacheEntries(cache, requests.length - maxEntries);
  }
}
