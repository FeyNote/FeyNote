import type { onDisconnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';
import { memoizedShadowDocsByDocName } from './memoizedShadowDocsByDocName';
import { SupportedDocumentType } from './SupportedDocumentType';
import { metrics } from '@feynote/api-services';

export async function onDisconnect(args: onDisconnectPayload) {
  const [type] = splitDocumentName(args.documentName);

  metrics.hocuspocusDisconnect.inc({
    document_type: type,
  });
  metrics.hocuspocusClientCount.set(args.instance.getConnectionsCount());
  metrics.hocuspocusDocumentCount.set(args.instance.getDocumentsCount());

  switch (type) {
    case SupportedDocumentType.Artifact: {
      memoizedShadowDocsByDocName.delete(args.documentName);
      break;
    }
  }
}
