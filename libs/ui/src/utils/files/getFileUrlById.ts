import { hmacSha256Hex, type SessionDTO } from '@feynote/shared-utils';
import { getApiUrls } from '../getApiUrls';

// This method is called quite frequently so I go ahead and stash the URLs for later lookup
const signaturePromiseCache = new Map<string, Promise<string>>();
const generatedUrlCache = new Map<string, string>();
let lookupCacheSessionId: string | undefined = undefined;

/**
 * This method builds file URLs by signing them with the user's session.
 * 1. The method will first attempt to look to see if we have a cached value and if so return that synchronously. This is useful if you're trying to specify a src on an HTML element, which can cause multi-loading every time there's a re-render in browser if it's always async.
 * 2. The method will see if there's a signature currently being generated, so that we don't generate multiple different timestamps to leverage HTTP caching.
 * 3. The method will create a signed URL.
 */
export const getFileUrlById = (
  id: string,
  session: SessionDTO | undefined,
): Promise<string> | string => {
  if (lookupCacheSessionId !== session?.id) {
    lookupCacheSessionId = session?.id;
    signaturePromiseCache.clear();
    generatedUrlCache.clear();
  }

  const cachedUrl = generatedUrlCache.get(id);
  if (cachedUrl) return cachedUrl;

  const cachedPromise = signaturePromiseCache.get(id);
  if (cachedPromise) return cachedPromise;

  const generate = async () => {
    const url = new URL(`${getApiUrls().rest}/file/${id}/redirect`);
    if (session) {
      if (session.id) {
        const timestamp = Date.now().toString();
        const signature = await hmacSha256Hex(
          session.token,
          `${id}-${timestamp}`,
        );

        url.searchParams.append('signature', signature);
        url.searchParams.append('timestamp', timestamp);
        url.searchParams.append('sessionId', session.id);
        url.searchParams.append('signatureVersion', '1');
      } else {
        // TODO: Remove this after some time, since this is just legacy support for those who don't have an id on their local token
        url.searchParams.append('token', session.token);
      }
    }

    return url.toString();
  };
  const promise = generate();

  signaturePromiseCache.set(id, promise);

  promise.then((url) => {
    signaturePromiseCache.delete(id);
    generatedUrlCache.set(id, url);
  });

  return promise;
};
