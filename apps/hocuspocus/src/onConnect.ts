import { onConnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';
import { logger, metrics } from '@feynote/api-services';

export async function onConnect(args: onConnectPayload) {
  try {
    const [type] = splitDocumentName(args.documentName);

    metrics.hocuspocusConnect.inc({
      document_type: type,
    });
    metrics.hocuspocusClientCount.set(args.instance.getConnectionsCount());
    metrics.hocuspocusDocumentCount.set(args.instance.getDocumentsCount());
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
