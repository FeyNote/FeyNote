import type { onDisconnectPayload } from '@hocuspocus/server';
import { splitDocumentName } from './splitDocumentName';
import { memoizedShadowDocsByDocName } from './memoizedShadowDocsByDocName';
import { SupportedDocumentType } from './SupportedDocumentType';

export async function onDisconnect(args: onDisconnectPayload) {
  const [type] = splitDocumentName(args.documentName);

  switch (type) {
    case SupportedDocumentType.Artifact: {
      memoizedShadowDocsByDocName.delete(args.documentName);
      break;
    }
  }
}
