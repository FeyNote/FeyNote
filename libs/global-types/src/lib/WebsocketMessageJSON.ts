import type { WebsocketMessageEvent } from './WebsocketMessageEvent';

export type WebsocketMessageJSON = {
  [WebsocketMessageEvent.ArtifactDeleted]: {
    artifactId: string;
  };
  [WebsocketMessageEvent.ArtifactUpdated]: {
    artifactId: string;
    updated: {
      title: boolean;
      text: boolean;
      readableUserIds: boolean;
      references: boolean;
    };
  };
  [WebsocketMessageEvent.ArtifactPinChanged]: {
    artifactId: string;
    pinned: boolean;
  };
};
