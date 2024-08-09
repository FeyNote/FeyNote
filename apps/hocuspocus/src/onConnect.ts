import { onConnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';

export async function onConnect(args: onConnectPayload) {
  try {
    splitDocumentName(args.documentName);
  } catch (e) {
    console.error(e);

    throw e;
  }
}
