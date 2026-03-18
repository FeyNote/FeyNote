export function abortSignalToPromise(signal: AbortSignal) {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise<void>((_, reject) => {
    signal.addEventListener('abort', () => reject(), { once: true });
  });
}
