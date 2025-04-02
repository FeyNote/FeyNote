import {
  WebsocketMessageEvent,
  WebsocketMessageJSON,
} from '@feynote/global-types';
import { EventName } from './EventName';

export type EventData = {
  [EventName.ArtifactDeleted]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactDeleted];
  [EventName.ArtifactUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactUpdated];
  [EventName.JobCompleted]: WebsocketMessageJSON[WebsocketMessageEvent.JobCompleted];
  [EventName.WebsocketError]: void;
  [EventName.WebsocketReconnect]: void;
};
