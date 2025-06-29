import { onConnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';
import { logger, metrics } from '@feynote/api-services';

export async function onConnect(args: onConnectPayload) {
  try {
    const [type] = splitDocumentName(args.documentName);

    metrics.hocuspocusConnection.inc({
      document_type: type,
    });
    metrics.hocuspocusConnectionCount.set(args.instance.getConnectionsCount());
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
