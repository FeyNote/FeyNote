import { onStoreDocumentPayload } from '@hocuspocus/server';
import {
  logger,
  metrics,
  splitDocumentName,
  SupportedDocumentType,
} from '@feynote/api-services';
import { onStoreArtifact } from './onStoreArtifact';
import { onStoreUserTree } from './onStoreUserTree';
import { onStoreWorkspace } from './onStoreWorkspace';

export async function onStoreDocument(args: onStoreDocumentPayload) {
  try {
    const [type, identifier] = splitDocumentName(args.documentName);

    metrics.hocuspocusDocumentLoad.inc({
      document_type: type,
    });

    const timer = metrics.hocuspocusDocumentStoreTime.startTimer();

    switch (type) {
      case SupportedDocumentType.Artifact:
        await onStoreArtifact(args, identifier);
        break;
      case SupportedDocumentType.UserTree:
        await onStoreUserTree(args, identifier);
        break;
      case SupportedDocumentType.Workspace:
        await onStoreWorkspace(args, identifier);
        break;
    }

    metrics.hocuspocusDocumentStoreTime.observe(
      { document_type: type },
      timer(),
    );

    args.document.getConnections().forEach((connection) => {
      connection.sendStateless(
        JSON.stringify({
          event: 'docSaved',
        }),
      );
    });
  } catch (e) {
    if (!(e instanceof Error) || e.message) {
      logger.error(e);
    }

    throw e;
  }
}
