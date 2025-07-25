export function assert<T>(
  condition: T,
  message: string | Error,
): asserts condition is Exclude<NonNullable<T>, false> {
  if (!condition) {
    if (typeof message === 'string') {
      throw new Error(message);
    } else {
      throw message;
    }
  }
}
