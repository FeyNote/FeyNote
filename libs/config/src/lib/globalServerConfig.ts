import { coerceBoolean } from './coerceBoolean';
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
  hocuspocus: {
    port: parseInt(process.env['HOCUSPOCUS_PORT'] || '8080'),
    writeDelayMs: parseInt(process.env['HOCUSPOCUS_WRITE_DELAY_MS'] || '2000'),
    maxWriteDelayMs: parseInt(
      process.env['HOCUSPOCUS_MAX_WRITE_DELAY_MS'] || '10000',
    ),
    connectionTimeout: parseInt(
      process.env['HOCUSPOCUS_CONNECTION_TIMEOUT'] || '15000',
    ),
    throttle: {
      enable: process.env['HOCUSPOCUS_THROTTLE_ENABLE']
        ? coerceBoolean(process.env['HOCUSPOCUS_THROTTLE_ENABLE'])
        : true,
      connectionsPerMinuteBeforeBan: parseInt(
        process.env['HOCUSPOCUS_THROTTLE_CPM'] || '1200',
      ),
      banTimeMinutes: parseInt(
        process.env['HOCUSPOCUS_THROTTLE_BAN_TIME_MINUTES'] || '10',
      ),
    },
    logging: {
      enable: process.env['HOCUSPOCUS_LOGGING_ENABLE']
        ? coerceBoolean(process.env['HOCUSPOCUS_LOGGING_ENABLE'])
        : true,
    },
    redis: {
      enable: process.env['HOCUSPOCUS_REDIS_ENABLE']
        ? coerceBoolean(process.env['HOCUSPOCUS_REDIS_ENABLE'])
        : true,
      host: process.env['HOCUSPOCUS_REDIS_HOST'],
      port: parseInt(process.env['HOCUSPOCUS_REDIS_PORT'] || '6379'),
    },
  },
  websocket: {
    redis: {
      host: process.env['WEBSOCKET_REDIS_HOST'],
      port: parseInt(process.env['WEBSOCKET_REDIS_PORT'] || '6379'),
    },
  },
  worker: {
    queueConcurrency: parseInt(process.env['WORKER_QUEUE_CONCURRENCY'] || '1'),
    queueCompleteCount: parseInt(
      process.env['WORKER_QUEUE_COMPLETE_COUNT'] || '1000',
    ),
    queueFailCount: parseInt(process.env['WORKER_QUEUE_FAIL_COUNT'] || '5000'),
    redis: {
      host: getEnvOrThrow('WORKER_REDIS_HOST'),
      port: parseInt(getEnvOrThrow('WORKER_REDIS_PORT')),
    },
  },
};
