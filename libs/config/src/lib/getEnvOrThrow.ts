export const getEnvOrThrow = (name: string) => {
  const envVar = process.env[name];
  if (!envVar) throw new Error(`Environment variable ${name} does not exist`);
  return envVar;
};
