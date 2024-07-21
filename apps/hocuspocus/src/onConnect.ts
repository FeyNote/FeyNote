import { onConnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';

export async function onConnect(args: onConnectPayload) {
  splitDocumentName(args.documentName);
}
