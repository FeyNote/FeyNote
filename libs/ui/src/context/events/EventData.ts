import {
  WebsocketMessageEvent,
  WebsocketMessageJSON,
} from '@feynote/global-types';
import { EventName } from './EventName';

export type EventData = {
  [EventName.ArtifactUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactUpdated];
  [EventName.ThreadUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ThreadUpdated];
  [EventName.WorkspaceUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.WorkspaceUpdated];

  [EventName.WebsocketError]: void;
  [EventName.WebsocketReconnect]: void;
  [EventName.WebsocketStatusChanged]: void;

  [EventName.LocaldbSessionUpdated]: void;
  [EventName.LocaldbEdgesUpdated]: {
    modifiedEdgeArtifactIds: string[];
  };
  [EventName.LocaldbSyncArtifact]: {
    artifactId: string;
  };
  [EventName.LocaldbSyncCompleted]: void;
  [EventName.LocaldbArtifactSnapshotUpdated]: {
    artifactId: string;
  };
  [EventName.LocaldbWorkspaceSnapshotUpdated]: {
    workspaceId: string;
  };
  [EventName.LocaldbKnownUsersUpdated]: void;
  [EventName.LocaldbIDBError]: {
    docName?: string;
    error: unknown;
  };
  [EventName.LocaldbPendingFileUploadFailed]: {
    id: string;
    fileName: string;
  };

  [EventName.ArtifactWelcomeCreated]: {
    welcomeId: string;
    introducingReferencesId: string;
  };

  [EventName.NavigatorOnline]: void;
  [EventName.NavigatorOffline]: void;
  [EventName.NavigatorVisible]: void;
  [EventName.NavigatorHidden]: void;
};
