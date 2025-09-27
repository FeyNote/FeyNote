export async function purgeOldestCacheEntries(cache: Cache, maxToDelete = 5) {
  const requests = await cache.keys();
  for (let i = 0; i < Math.min(maxToDelete, requests.length); i++) {
    await cache.delete(requests[i]);
  }
}
