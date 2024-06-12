import { getEnvOrThrow } from './getEnvOrThrow';

export const globalServerConfig = {
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
  openai: {
    apiKey: getEnvOrThrow('OPENAI_API_KEY'),
  },
  redis: {
    host: getEnvOrThrow('REDIS_HOST'),
    port: parseInt(getEnvOrThrow('REDIS_PORT')),
  },
  worker: {
    queueConcurrency: parseInt(process.env['WORKER_QUEUE_CONCURRENCY'] || '1'),
    queueCompleteCount: parseInt(
      process.env['WORKER_QUEUE_COMPLETE_COUNT'] || '1000',
    ),
    queueFailCount: parseInt(process.env['WORKER_QUEUE_FAIL_COUNT'] || '5000'),
  },
};
