import { coerceBoolean } from './coerceBoolean';
import { getEnvOrThrow } from './getEnvOrThrow';

export const globalServerConfig = {
  logger: {
    level: process.env['LOGGER_LEVEL'] || 'http',
    transports: {
      console: coerceBoolean(
        process.env['LOGGER_TRANSPORTS_CONSOLE'] || 'false',
      ),
      sentry: coerceBoolean(process.env['LOGGER_TRANSPORTS_SENTRY'] || 'false'),
    },
  },
  email: {
    fromName: getEnvOrThrow('EMAIL_FROM_NAME'),
    fromAddress: getEnvOrThrow('EMAIL_FROM_ADDRESS'),
    replyToAddress: getEnvOrThrow('EMAIL_REPLY_TO_ADDRESS'),
  },
  aws: {
    region: getEnvOrThrow('AWS_REGION'),
    accessKeyId: getEnvOrThrow('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvOrThrow('AWS_SECRET_ACCESS_KEY'),
    buckets: {
      artifact: getEnvOrThrow('AWS_BUCKET_ARTIFACT'),
      job: getEnvOrThrow('AWS_BUCKET_JOB'),
    },
  },
  typesense: {
    apiKey: getEnvOrThrow('TYPESENSE_API_KEY'),
    nodes: getEnvOrThrow('TYPESENSE_NODES'),
  },
  openai: {
    apiKey: getEnvOrThrow('OPENAI_API_KEY'),
  },
  proxy: {
    enabled: coerceBoolean(getEnvOrThrow('PROXY_ENABLED')),
    url: getEnvOrThrow('PROXY_URL'),
    username: getEnvOrThrow('PROXY_USERNAME'),
    password: getEnvOrThrow('PROXY_PASSWORD'),
  },
  api: {
    port: parseInt(process.env['API_PORT'] || '8080'),
  },
  hocuspocus: {
    wsPort: parseInt(process.env['HOCUSPOCUS_WS_PORT'] || '8080'),
    restPort: parseInt(process.env['HOCUSPOCUS_REST_PORT'] || '8081'),
    internalRestBaseUrl: getEnvOrThrow('HOCUSPOCUS_INTERNAL_REST_BASE_URL'),
    apiKey: getEnvOrThrow('HOCUSPOCUS_API_KEY'),
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
    redis: {
      host: process.env['HOCUSPOCUS_REDIS_HOST'],
      port: parseInt(process.env['HOCUSPOCUS_REDIS_PORT'] || '6379'),
      keyPrefix: process.env['HOCUSPOCUS_REDIS_KEY_PREFIX'] || 'fnhocus_',
    },
  },
  websocket: {
    wsPort: parseInt(process.env['WEBSOCKET_WS_PORT'] || '8080'),
    restPort: parseInt(process.env['WEBSOCKET_REST_PORT'] || '8081'),
    queueConcurrency: parseInt(process.env['WORKER_QUEUE_CONCURRENCY'] || '2'),
    queueCompleteCount: parseInt(
      process.env['WORKER_QUEUE_COMPLETE_COUNT'] || '1000',
    ),
    queueFailCount: parseInt(process.env['WORKER_QUEUE_FAIL_COUNT'] || '5000'),
    redis: {
      host: process.env['WEBSOCKET_REDIS_HOST'],
      port: parseInt(process.env['WEBSOCKET_REDIS_PORT'] || '6379'),
      keyPrefix: process.env['WEBSOCKET_REDIS_KEY_PREFIX'] || 'fnws_',
    },
  },
  worker: {
    restPort: parseInt(process.env['WORKER_REST_PORT'] || '8080'),
    queueConcurrency: parseInt(process.env['WORKER_QUEUE_CONCURRENCY'] || '1'),
    queueCompleteCount: parseInt(
      process.env['WORKER_QUEUE_COMPLETE_COUNT'] || '1000',
    ),
    queueFailCount: parseInt(process.env['WORKER_QUEUE_FAIL_COUNT'] || '5000'),
    redis: {
      host: getEnvOrThrow('WORKER_REDIS_HOST'),
      port: parseInt(process.env['WORKER_REDIS_PORT'] || '6379'),
      keyPrefix: process.env['WORKER_REDIS_LEY_PREFIX'] || 'fnworker_',
    },
  },
  sentry: {
    api: {
      dsn: 'https://aa046a905df8da04a718afb43cfcbb38@o4508428193955840.ingest.us.sentry.io/4508428256411648',
      samplingRate: parseFloat(process.env['SENTRY_API_SAMPLING_RATE'] || '1'),
    },
    hocuspocus: {
      dsn: 'https://d532e53fe91f06e1f8d37a68eba3ffc6@o4508428193955840.ingest.us.sentry.io/4508428775522304',
      samplingRate: parseFloat(
        process.env['SENTRY_HOCUSPOCUS_SAMPLING_RATE'] || '1',
      ),
    },
    websocket: {
      dsn: 'https://2ea5794d67f2d41f6505ed777dfd281b@o4508428193955840.ingest.us.sentry.io/4508428810911744',
      samplingRate: parseFloat(
        process.env['SENTRY_WEBSOCKET_SAMPLING_RATE'] || '1',
      ),
    },
    queueWorker: {
      dsn: 'https://1bbce81476ff1ead7c27ec76289a4892@o4508428193955840.ingest.us.sentry.io/4508428812877824',
      samplingRate: parseFloat(
        process.env['SENTRY_QUEUE_WORKER_SAMPLING_RATE'] || '1',
      ),
    },
  },
  stripe: {
    webhookSecret: getEnvOrThrow('STRIPE_WEBHOOK_SECRET'),
    apiKey: getEnvOrThrow('STRIPE_API_KEY'),
  },
};
