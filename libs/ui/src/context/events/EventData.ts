import {
  WebsocketMessageEvent,
  WebsocketMessageJSON,
} from '@feynote/global-types';
import { EventName } from './EventName';

export type EventData = {
  [EventName.ArtifactDeleted]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactDeleted];
  [EventName.ArtifactUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactUpdated];
  [EventName.ArtifactPinChanged]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactPinChanged];
  [EventName.WebsocketError]: void;
  [EventName.WebsocketReconnect]: void;
};
