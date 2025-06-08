import { onConnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';
import { logger } from '@feynote/api-services';

export async function onConnect(args: onConnectPayload) {
  try {
    splitDocumentName(args.documentName);
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
