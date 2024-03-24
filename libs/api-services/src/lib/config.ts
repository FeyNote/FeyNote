const getEnvOrThrow = (name: string) => {
  const envVar = process.env[name];
  if (!envVar) throw new Error(`Environment variable ${name} does not exist`);
  return envVar;
};

export const config = {
  email: {
    fromName: getEnvOrThrow('EMAIL_FROM_NAME'),
    fromAddress: getEnvOrThrow('EMAIL_FROM_ADDRESS'),
    replyToAddress: getEnvOrThrow('EMAIL_REPLY_TO_ADDRESS'),
  },
  aws: {
    region: getEnvOrThrow('AWS_REGION'),
    accessKeyId: getEnvOrThrow('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvOrThrow('AWS_SECRET_ACCESS_KEY'),
  },
  typesense: {
    apiKey: getEnvOrThrow('TYPESENSE_API_KEY'),
    nodes: getEnvOrThrow('TYPESENSE_NODES'),
  },
};
