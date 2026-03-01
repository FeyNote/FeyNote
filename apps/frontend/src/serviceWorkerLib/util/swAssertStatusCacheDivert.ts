/**
 * An error wrapper to keep the original http response
 * so that it can be passed back out of the service worker transparently
 * if cache fails
 */
export class SWHttpCapturedError extends Error {
  originalResponse: Response;

  constructor(originalResponse: Response) {
    super();

    this.originalResponse = originalResponse;
  }
}

/**
 * A place to decide if a status code coming from the server could be handled by
 * cache instead.
 */
export function swAssertStatusCacheDivert(response: Response) {
  // 500-level errors can be diverted to cache to make server downtime a little more pleasant
  if (response.status >= 500) {
    throw new SWHttpCapturedError(response);
  }
}
