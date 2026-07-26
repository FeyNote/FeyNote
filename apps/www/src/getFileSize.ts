const CACHE_TTL_MINUTES = 24 * 60;
const REQUEST_TIMEOUT_MS = 5000;
const cache = new Map<string, number>();

setInterval(() => cache.clear(), CACHE_TTL_MINUTES * 60 * 1000);

export async function getFileSize(url: string): Promise<number | null> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const contentLength = res.headers.get('content-length');
    if (contentLength) {
      const bytes = Number(contentLength);
      cache.set(url, bytes);
      return bytes;
    }
  } catch {
    return null;
  }

  return null;
}
