export const RequiredForSelfhost = Symbol('required');

export const getEnvOrThrow = <
  T extends string | undefined | boolean | typeof RequiredForSelfhost,
>(
  name: string,
  fallbackForSelfhost: T,
): Exclude<T, typeof RequiredForSelfhost> | string => {
  const envVar = process.env[name];
  if (!envVar) {
    if (
      fallbackForSelfhost !== RequiredForSelfhost &&
      process.env['SELFHOST'] === 'true'
    ) {
      return fallbackForSelfhost as Exclude<T, typeof RequiredForSelfhost>;
    }
    throw new Error(`Environment variable ${name} does not exist`);
  }
  return envVar;
};
