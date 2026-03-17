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

  [EventName.ArtifactWelcomeCreated]: {
    welcomeId: string;
    introducingReferencesId: string;
  };

  [EventName.AppOnline]: void;
  [EventName.AppVisible]: void;
};
