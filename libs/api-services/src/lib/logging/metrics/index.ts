import client from 'prom-client';

export * from './init';

/**
 * All app-wide (server-side) metrics should live here.
 *
 * VERY IMPORTANT:
 * - The cardinality of all labels _must remain low_. Do not put IDs, or other highly-variable parameters within labels. Only values with known-quantities should be included in labels
 * - All names and labels must be snake_case
 */
export const metrics = {
  apiRequest: new client.Histogram({
    name: 'api_request',
    help: 'Every time a request hits the app',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.01, 0.05, 0.3, 0.7, 2, 5], // Each of these is tracked in seconds
  }),
  accountCreated: new client.Counter({
    name: 'account_created',
    help: 'New account created',
    labelNames: ['auth_type'],
  }),
  accountLogin: new client.Counter({
    name: 'account_login',
    help: 'A login to an account',
    labelNames: ['auth_type'],
  }),
  accountTriggerResetPassword: new client.Counter({
    name: 'account_trigger_reset_password',
    help: 'A password reset email was triggered',
    labelNames: [],
  }),
  accountResetPassword: new client.Counter({
    name: 'account_reset_password',
    help: 'An account password was changed',
    labelNames: [],
  }),
  accountTriggerResetEmail: new client.Counter({
    name: 'account_trigger_reset_email',
    help: 'An email reset email was triggered',
    labelNames: [],
  }),
  accountResetEmail: new client.Counter({
    name: 'account_reset_email',
    help: 'An account email was changed',
    labelNames: [],
  }),

  hocuspocusConnection: new client.Counter({
    name: 'hocuspocus_connection',
    help: 'New connection opened to a document',
    labelNames: ['document_type'],
  }),
  hocuspocusDisconnect: new client.Counter({
    name: 'hocuspocus_disconnect',
    help: 'Client disconnected from a document',
    labelNames: ['document_type'],
  }),
  hocuspocusConnectionCount: new client.Gauge({
    name: 'hocuspocus_connection_count',
    help: 'Total number of connections',
    labelNames: [],
  }),
  hocuspocusMessage: new client.Counter({
    name: 'hocuspocus_message',
    help: 'A message received',
    labelNames: ['document_type'],
  }),
  hocuspocusMessageValidateTime: new client.Histogram({
    name: 'hocuspocus_message_validate_time',
    help: 'A message was validated',
    labelNames: ['document_type'],
    buckets: [0.001, 0.005, 0.01, 0.03, 0.05, 0.1, 0.5, 1, 2], // Each of these is tracked in seconds
  }),
  hocuspocusDocumentLoad: new client.Counter({
    name: 'hocuspocus_document_load',
    help: 'A document was loaded',
    labelNames: ['document_type'],
  }),
  hocuspocusDocumentSave: new client.Counter({
    name: 'hocuspocus_document_save',
    help: 'A document was saved',
    labelNames: ['document_type'],
  }),
  hocuspocusAuthenticate: new client.Counter({
    name: 'hocuspocus_authenticate',
    help: 'A client authenticated',
    labelNames: ['document_type'],
  }),
  hocuspocusAuthenticateAttempt: new client.Counter({
    name: 'hocuspocus_authenticate_attempt',
    help: 'A client attempted to authenticate',
    labelNames: ['document_type'],
  }),
  hocuspocusAuthenticateFailed: new client.Counter({
    name: 'hocuspocus_authenticate_failed',
    help: 'A client attempted to authenticate but failed',
    labelNames: ['document_type'],
  }),

  websocketConnection: new client.Counter({
    name: 'websocket_connection',
    help: 'New connection opened to the websocket server',
    labelNames: [],
  }),
  websocketConnectionCount: new client.Gauge({
    name: 'websocket_connection_count',
    help: 'Total number of connections',
    labelNames: [],
  }),
  websocketMessageIncoming: new client.Counter({
    name: 'websocket_message_incoming',
    help: 'A websocket message was received by the server from a client',
    labelNames: ['message_type'],
  }),
  websocketMessageIncomingProcessed: new client.Counter({
    name: 'websocket_message_incoming_processed',
    help: 'A websocket message received by the server from a client was processed',
    labelNames: ['message_type'],
  }),
  websocketMessageOutgoing: new client.Counter({
    name: 'websocket_message_outgoing',
    help: 'A websocket message was sent from the server to a client',
    labelNames: ['message_type'],
  }),
  websocketMessageOutgoingProcessed: new client.Counter({
    name: 'websocket_message_outgoing_processed',
    help: 'A websocket message sent from the server to a client as processed',
    labelNames: ['message_type'],
  }),

  jobQueued: new client.Counter({
    name: 'job_queued',
    help: 'A job has been processed in the queue',
    labelNames: ['job_type'],
  }),
  jobStarted: new client.Counter({
    name: 'job_started',
    help: 'A job has been picked up by a worker in the queue',
    labelNames: ['job_type'],
  }),
  jobProcessed: new client.Histogram({
    name: 'job_processed',
    help: 'A job has been processed in the queue',
    labelNames: ['job_type'],
    buckets: [0.001, 0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10, 30], // Each of these is tracked in seconds
  }),
  jobFailed: new client.Counter({
    name: 'job_failed',
    help: 'A job has been processed in the queue but failed',
    labelNames: ['job_type', 'elapsed'],
  }),
};
