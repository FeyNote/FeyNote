import type { JobType } from '@prisma/client';
import type { WebsocketMessageEvent } from './WebsocketMessageEvent';

export type WebsocketMessageJSON = {
  [WebsocketMessageEvent.ArtifactUpdated]: {
    artifactId: string;
    updated: {
      title: boolean;
      text: boolean;
      readableUserIds: boolean;
      references: boolean;
      deletedAt: boolean;
    };
  };
  [WebsocketMessageEvent.JobCompleted]: {
    jobId: string;
    type: JobType;
  };
  [WebsocketMessageEvent.ThreadUpdated]: {
    threadId: string;
  };
};
