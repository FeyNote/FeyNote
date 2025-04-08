import {
  WebsocketMessageEvent,
  WebsocketMessageJSON,
} from '@feynote/global-types';
import { EventName } from './EventName';

export type EventData = {
  [EventName.ArtifactUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactUpdated];
  [EventName.WebsocketError]: void;
  [EventName.WebsocketReconnect]: void;
};
